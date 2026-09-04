import React, { useState, useRef } from 'react';
import type { FormDocument } from '../types/form';
import { Button } from './ui/Button';
import { FieldCreatorModal } from './FieldCreatorModal';
import { computeSha256 } from '../utils/crypto';
import { parseFormDocument, serializeFormDocument } from '../utils/parser';
import {
  ShieldCheck,
  Plus,
  Play,
  FileCode,
  CheckCircle,
} from 'lucide-react';

interface TemplateEditorProps {
  document: FormDocument;
  onUpdateDocument: (doc: FormDocument) => void;
  onSwitchToFillMode: () => void;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({
  document: doc,
  onUpdateDocument,
  onSwitchToFillMode,
}) => {
  const [rawMarkdown, setRawMarkdown] = useState(() => serializeFormDocument(doc));
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [isSealing, setIsSealing] = useState(false);
  const [sealNotification, setSealNotification] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Sync state if doc changes from outside
  React.useEffect(() => {
    setRawMarkdown(serializeFormDocument(doc));
  }, [doc]);

  const handleTextChange = async (newVal: string) => {
    setRawMarkdown(newVal);
    const parsed = await parseFormDocument(newVal);
    onUpdateDocument(parsed);
  };

  const handleInsertFieldToken = (token: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      handleTextChange(rawMarkdown + '\n' + token);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const nextContent = rawMarkdown.substring(0, start) + token + rawMarkdown.substring(end);
    handleTextChange(nextContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + token.length, start + token.length);
    }, 50);
  };

  const handleSealTemplate = async () => {
    setIsSealing(true);
    try {
      const parsed = await parseFormDocument(rawMarkdown);
      const newChecksum = await computeSha256(parsed.templateBody);

      parsed.metadata.template_checksum = newChecksum;
      parsed.metadata.status = 'template';
      parsed.verification = {
        status: 'verified',
        isValid: true,
        computedHash: newChecksum,
        expectedHash: newChecksum,
        timestamp: new Date().toISOString(),
        message: 'Template integrity sealed with SHA-256.',
      };

      const serialized = serializeFormDocument(parsed);
      setRawMarkdown(serialized);
      onUpdateDocument(parsed);

      setSealNotification(`Template sealed with ${newChecksum.substring(0, 18)}...`);
      setTimeout(() => setSealNotification(null), 4000);
    } finally {
      setIsSealing(false);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* Designer Toolbar */}
      <div className="px-5 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-400">
            <FileCode className="w-4 h-4" />
            <span>TEMPLATE DESIGNER & MARKDOWN EDITOR</span>
          </div>

          <span className="text-slate-700">|</span>

          {/* Quick Insert Field Button */}
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsFieldModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 shadow-xs text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Typeform Field
          </Button>

          {/* Quick Shortcuts */}
          <div className="hidden lg:flex items-center gap-1">
            {[
              { label: '+ Text', token: '{{input:field_id label="Field Label"}}' },
              { label: '+ Choice', token: '{{choice:options_id label="Select Option" options="Option A, Option B, Option C" style="chips"}}' },
              { label: '+ Rating', token: '{{rating:satisfaction label="Rating" max=5 icon="star"}}' },
              { label: '+ Signature', token: '{{signature:sig label="Signature" required=true}}' },
            ].map((shortcut) => (
              <button
                key={shortcut.label}
                onClick={() => handleInsertFieldToken(shortcut.token)}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-mono cursor-pointer transition-colors"
              >
                {shortcut.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {sealNotification && (
            <span className="text-xs text-emerald-400 flex items-center gap-1 animate-in fade-in">
              <CheckCircle className="w-3.5 h-3.5" />
              {sealNotification}
            </span>
          )}

          {/* Seal Template Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSealTemplate}
            disabled={isSealing}
            className="border-emerald-700/80 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60 text-xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
            {isSealing ? 'Sealing...' : 'Seal Template (SHA-256)'}
          </Button>

          {/* Switch to Fill Mode */}
          <Button
            variant="default"
            size="sm"
            onClick={onSwitchToFillMode}
            className="bg-blue-600 hover:bg-blue-500 text-xs"
          >
            <Play className="w-3.5 h-3.5 mr-1" />
            Switch to Fill & View Mode
          </Button>
        </div>
      </div>

      {/* Code Editor Body */}
      <div className="flex-1 flex overflow-hidden">
        <div className="w-full flex flex-col h-full bg-slate-950">
          <div className="px-4 py-1.5 bg-slate-900/60 border-b border-slate-800 text-[11px] text-slate-400 font-mono flex items-center justify-between">
            <span>Markdown Source with Frontmatter & Field Tokens</span>
            <span>UTF-8 • Form directives format: `&#123;&#123;type:id ...&#125;&#125;`</span>
          </div>

          <textarea
            ref={textareaRef}
            value={rawMarkdown}
            onChange={(e) => handleTextChange(e.target.value)}
            spellCheck={false}
            className="flex-1 p-6 font-mono text-xs leading-relaxed text-slate-200 bg-slate-950 focus:outline-none resize-none selection:bg-blue-600/40"
          />
        </div>
      </div>

      <FieldCreatorModal
        isOpen={isFieldModalOpen}
        onClose={() => setIsFieldModalOpen(false)}
        onInsertField={handleInsertFieldToken}
      />
    </div>
  );
};
