import React, { useState, useRef, useEffect } from 'react';
import type { FormDocument } from '../types/form';
import { Button } from './ui/Button';
import { FieldCreatorModal } from './FieldCreatorModal';
import { VisualFormBuilder } from './VisualFormBuilder';
import { PdfPaperViewer } from './PdfPaperViewer';
import { computeSha256 } from '../utils/crypto';
import { parseFormDocument, serializeFormDocument } from '../utils/parser';
import { markdownToVisualBlocks, visualBlocksToMarkdown, type VisualBlock } from '../utils/visualBlocks';
import {
  ShieldCheck,
  Plus,
  Play,
  FileCode,
  CheckCircle,
  LayoutGrid,
  Columns,
  Sparkles,
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
  // Mode inside template builder: 'visual' or 'text'
  const [builderMode, setBuilderMode] = useState<'visual' | 'text'>('visual');
  const [showLivePreview, setShowLivePreview] = useState(true);
  const [rawMarkdown, setRawMarkdown] = useState(() => serializeFormDocument(doc));
  const [visualBlocks, setVisualBlocks] = useState<VisualBlock[]>(() =>
    markdownToVisualBlocks(doc.templateBody)
  );

  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [isSealing, setIsSealing] = useState(false);
  const [sealNotification, setSealNotification] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Sync state if external doc changes
  useEffect(() => {
    setRawMarkdown(serializeFormDocument(doc));
    setVisualBlocks(markdownToVisualBlocks(doc.templateBody));
  }, [doc.templateBody, doc.metadata]);

  // Handle updates from Markdown text editor
  const handleTextChange = async (newVal: string) => {
    setRawMarkdown(newVal);
    const parsed = await parseFormDocument(newVal);
    onUpdateDocument(parsed);
  };

  // Switch to Visual Mode: parse current markdown into blocks
  const handleSwitchToVisual = async () => {
    const parsed = await parseFormDocument(rawMarkdown);
    setVisualBlocks(markdownToVisualBlocks(parsed.templateBody));
    setBuilderMode('visual');
  };

  // Switch to Text Mode: serialize blocks into markdown
  const handleSwitchToText = () => {
    const updatedBody = visualBlocksToMarkdown(visualBlocks);
    const updatedDoc: FormDocument = {
      ...doc,
      templateBody: updatedBody,
    };
    const serialized = serializeFormDocument(updatedDoc);
    setRawMarkdown(serialized);
    setBuilderMode('text');
  };

  // Handle changes from Visual Form Builder
  const handleVisualBlocksChange = async (newBlocks: VisualBlock[]) => {
    setVisualBlocks(newBlocks);
    const newTemplateBody = visualBlocksToMarkdown(newBlocks);
    const nextDoc: FormDocument = {
      ...doc,
      templateBody: newTemplateBody,
    };
    const serialized = serializeFormDocument(nextDoc);
    setRawMarkdown(serialized);
    const parsed = await parseFormDocument(serialized);
    onUpdateDocument(parsed);
  };

  // Handle metadata updates (title, template_id) from Visual Builder
  const handleUpdateMetadata = async (meta: Partial<FormDocument['metadata']>) => {
    const nextDoc: FormDocument = {
      ...doc,
      metadata: { ...doc.metadata, ...meta },
    };
    const serialized = serializeFormDocument(nextDoc);
    setRawMarkdown(serialized);
    const parsed = await parseFormDocument(serialized);
    onUpdateDocument(parsed);
  };

  // Insert field directive into text mode
  const handleInsertFieldToken = (token: string) => {
    if (builderMode === 'text') {
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
    } else {
      // In visual mode, append token to body and parse to blocks
      const updatedBody = doc.templateBody.trim() + '\n\n' + token;
      const nextBlocks = markdownToVisualBlocks(updatedBody);
      handleVisualBlocksChange(nextBlocks);
    }
  };

  // Seal Template (Calculate SHA-256)
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

      setSealNotification(`Sealed with ${newChecksum.substring(0, 18)}...`);
      setTimeout(() => setSealNotification(null), 4000);
    } finally {
      setIsSealing(false);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* Designer Toolbar */}
      <div className="px-5 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-3">
          {/* Builder Mode Switcher: Visual Mode vs Markdown Text Mode */}
          <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={handleSwitchToVisual}
              className={`px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                builderMode === 'visual'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Visual Builder</span>
            </button>
            <button
              onClick={handleSwitchToText}
              className={`px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                builderMode === 'text'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Markdown Source</span>
            </button>
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

          {/* Live Preview Toggle */}
          <button
            onClick={() => setShowLivePreview((prev) => !prev)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 border transition-colors cursor-pointer ${
              showLivePreview
                ? 'bg-slate-800 border-blue-500/50 text-blue-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Split Preview</span>
          </button>
        </div>

        {/* Right Actions: Seal Template & Switch to Fill Mode */}
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
            Test Fill & View
          </Button>
        </div>
      </div>

      {/* Editor Body: Left side editor, Right side live PDF preview */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Visual or Text Editor */}
        <div
          className={`flex flex-col h-full overflow-y-auto border-r border-slate-800 transition-all ${
            showLivePreview ? 'w-1/2' : 'w-full'
          }`}
        >
          {builderMode === 'visual' ? (
            <VisualFormBuilder
              document={doc}
              blocks={visualBlocks}
              onChangeBlocks={handleVisualBlocksChange}
              onUpdateMetadata={handleUpdateMetadata}
              onOpenFieldModal={() => setIsFieldModalOpen(true)}
            />
          ) : (
            <div className="w-full flex flex-col h-full bg-slate-950">
              <div className="px-4 py-1.5 bg-slate-900/60 border-b border-slate-800 text-[11px] text-slate-400 font-mono flex items-center justify-between shrink-0">
                <span>Markdown & Frontmatter Code Editor</span>
                <span>Typeform tokens: `&#123;&#123;type:id ...&#125;&#125;`</span>
              </div>
              <textarea
                ref={textareaRef}
                value={rawMarkdown}
                onChange={(e) => handleTextChange(e.target.value)}
                spellCheck={false}
                className="flex-1 p-6 font-mono text-xs leading-relaxed text-slate-200 bg-slate-950 focus:outline-none resize-none selection:bg-blue-600/40"
              />
            </div>
          )}
        </div>

        {/* Right Side: Live PDF Paper Sheet Preview */}
        {showLivePreview && (
          <div className="w-1/2 flex flex-col h-full bg-slate-900/90 overflow-y-auto">
            <div className="px-4 py-1.5 bg-slate-950/80 border-b border-slate-800 text-[11px] text-slate-400 font-medium flex items-center justify-between shrink-0 select-none">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-blue-400" />
                Live PDF Paper Preview (Updates in Real-Time)
              </span>
              <span className="font-mono text-[10px] text-slate-500">A4 / Letter Sheet</span>
            </div>
            <div className="flex-1 p-4 flex justify-center scale-90 origin-top">
              <PdfPaperViewer
                document={doc}
                onFieldValueChange={() => {}}
                highlightFields={true}
                zoom={0.85}
                onOpenSecurityModal={() => {}}
              />
            </div>
          </div>
        )}
      </div>

      <FieldCreatorModal
        isOpen={isFieldModalOpen}
        onClose={() => setIsFieldModalOpen(false)}
        onInsertField={handleInsertFieldToken}
      />
    </div>
  );
};
