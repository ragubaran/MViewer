import React from 'react';
import type { FormDocument, FormFieldConfig } from '../types/form';
import type { VisualBlock } from '../utils/visualBlocks';
import { Button } from './ui/Button';
import {
  ArrowUp,
  ArrowDown,
  Trash2,
  Copy,
  Heading,
  AlignLeft,
  Minus,
  Sparkles,
  HelpCircle,
  CheckSquare,
  PenTool,
  Calendar,
  DollarSign,
  Star,
  Layers,
  Sliders,
  Type,
  Mail,
  Phone,
  Paperclip,
  ToggleLeft,
} from 'lucide-react';

interface VisualFormBuilderProps {
  document: FormDocument;
  blocks: VisualBlock[];
  onChangeBlocks: (newBlocks: VisualBlock[]) => void;
  onUpdateMetadata: (meta: Partial<FormDocument['metadata']>) => void;
  onOpenFieldModal: () => void;
}

export const VisualFormBuilder: React.FC<VisualFormBuilderProps> = ({
  document: doc,
  blocks,
  onChangeBlocks,
  onUpdateMetadata,
  onOpenFieldModal,
}) => {
  // Move block up
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const next = [...blocks];
    const temp = next[index - 1];
    next[index - 1] = next[index];
    next[index] = temp;
    onChangeBlocks(next);
  };

  // Move block down
  const handleMoveDown = (index: number) => {
    if (index === blocks.length - 1) return;
    const next = [...blocks];
    const temp = next[index + 1];
    next[index + 1] = next[index];
    next[index] = temp;
    onChangeBlocks(next);
  };

  // Delete block
  const handleDelete = (index: number) => {
    const next = blocks.filter((_, i) => i !== index);
    onChangeBlocks(next);
  };

  // Duplicate block
  const handleDuplicate = (index: number) => {
    const target = blocks[index];
    const cloned: VisualBlock = JSON.parse(JSON.stringify(target));
    cloned.id = `${cloned.type}-${Math.random().toString(36).slice(2, 7)}`;
    if (cloned.field) {
      cloned.field.id = `${cloned.field.id}_copy_${Math.random().toString(36).slice(2, 5)}`;
      cloned.field.label = `${cloned.field.label || 'Question'} (Copy)`;
    }
    const next = [...blocks.slice(0, index + 1), cloned, ...blocks.slice(index + 1)];
    onChangeBlocks(next);
  };

  // Update specific block
  const handleUpdateBlock = (index: number, updated: Partial<VisualBlock>) => {
    const next = [...blocks];
    next[index] = { ...next[index], ...updated };
    onChangeBlocks(next);
  };

  // Update field config within block
  const handleUpdateField = (index: number, updatedField: Partial<FormFieldConfig>) => {
    const target = blocks[index];
    if (!target.field) return;
    const next = [...blocks];
    next[index] = {
      ...target,
      field: { ...target.field, ...updatedField },
    };
    onChangeBlocks(next);
  };

  // Add basic blocks
  const handleAddHeading = () => {
    const next: VisualBlock[] = [
      ...blocks,
      {
        id: `h2-${Math.random().toString(36).slice(2, 7)}`,
        type: 'heading',
        level: 2,
        headingText: 'New Section Title',
      },
    ];
    onChangeBlocks(next);
  };

  const handleAddText = () => {
    const next: VisualBlock[] = [
      ...blocks,
      {
        id: `text-${Math.random().toString(36).slice(2, 7)}`,
        type: 'text',
        content: 'Enter instructions, explanations, or legal clauses here...',
        isQuote: false,
      },
    ];
    onChangeBlocks(next);
  };

  const handleAddDivider = () => {
    const next: VisualBlock[] = [
      ...blocks,
      {
        id: `divider-${Math.random().toString(36).slice(2, 7)}`,
        type: 'divider',
      },
    ];
    onChangeBlocks(next);
  };

  const handleAddYesNo = () => {
    const suffix = Math.random().toString(36).slice(2, 7);
    const next: VisualBlock[] = [
      ...blocks,
      {
        id: `field-yesno_${suffix}-${suffix}`,
        type: 'field',
        field: { id: `yesno_${suffix}`, type: 'yesno', label: 'Do you agree?' },
      },
    ];
    onChangeBlocks(next);
  };

  const getFieldIcon = (type: string) => {
    switch (type) {
      case 'text': return Type;
      case 'email': return Mail;
      case 'phone': return Phone;
      case 'number':
      case 'currency': return DollarSign;
      case 'date': return Calendar;
      case 'choice':
      case 'select':
      case 'yesno': return CheckSquare;
      case 'rating': return Star;
      case 'scale': return Layers;
      case 'slider': return Sliders;
      case 'signature': return PenTool;
      case 'file': return Paperclip;
      default: return HelpCircle;
    }
  };

  return (
    <div className="w-full flex flex-col p-6 space-y-6 max-w-4xl mx-auto">
      {/* Document Meta Settings Card */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-md">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Document Header & Identity
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            Form Version: {doc.metadata.version || '1.0.0'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Document Title
            </label>
            <input
              type="text"
              value={doc.metadata.title || ''}
              onChange={(e) => onUpdateMetadata({ title: e.target.value })}
              placeholder="e.g. Patient Intake & Consent Form"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Template Identifier ID
            </label>
            <input
              type="text"
              value={doc.metadata.template_id || ''}
              onChange={(e) => onUpdateMetadata({ template_id: e.target.value })}
              placeholder="e.g. form-2026-med-01"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm font-mono text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Visual Blocks List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Form Blocks & Questions ({blocks.length})
          </span>
          <span className="text-xs text-slate-500">
            Click on any field to edit. Reorder with arrows.
          </span>
        </div>

        {blocks.map((block, idx) => {
          return (
            <div
              key={block.id}
              className="group bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl p-4 shadow-xs transition-all relative"
            >
              {/* Top Controls Bar on Card */}
              <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] font-bold text-slate-400 flex items-center justify-center">
                    {idx + 1}
                  </span>

                  {/* Block Type Badge */}
                  {block.type === 'heading' ? (
                    <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 text-[11px] font-semibold border border-blue-800/60 flex items-center gap-1">
                      <Heading className="w-3 h-3" />
                      Heading (H{block.level})
                    </span>
                  ) : block.type === 'text' ? (
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-semibold border border-slate-700 flex items-center gap-1">
                      <AlignLeft className="w-3 h-3" />
                      {block.isQuote ? 'Legal Quote / Disclaimer' : 'Paragraph Text'}
                    </span>
                  ) : block.type === 'divider' ? (
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[11px] font-semibold flex items-center gap-1">
                      <Minus className="w-3 h-3" />
                      Section Divider
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 text-[11px] font-semibold border border-indigo-800/60 flex items-center gap-1">
                      {React.createElement(getFieldIcon(block.field?.type || 'text'), { className: 'w-3 h-3' })}
                      {block.field?.type?.toUpperCase()} FIELD
                    </span>
                  )}
                </div>

                {/* Card Action Controls: Reorder, Copy, Delete */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleMoveUp(idx)}
                    disabled={idx === 0}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                    title="Move up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMoveDown(idx)}
                    disabled={idx === blocks.length - 1}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                    title="Move down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDuplicate(idx)}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                    title="Duplicate block"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(idx)}
                    className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 cursor-pointer"
                    title="Delete block"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Block Content Editing */}
              {block.type === 'heading' && (
                <div className="flex gap-3 items-center">
                  <select
                    value={block.level || 2}
                    onChange={(e) => handleUpdateBlock(idx, { level: Number(e.target.value) as 1 | 2 | 3 })}
                    className="px-2 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                  >
                    <option value={1}>H1 Title</option>
                    <option value={2}>H2 Section</option>
                    <option value={3}>H3 Subsection</option>
                  </select>
                  <input
                    type="text"
                    value={block.headingText || ''}
                    onChange={(e) => handleUpdateBlock(idx, { headingText: e.target.value })}
                    placeholder="Enter heading text..."
                    className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-sm font-semibold text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              )}

              {block.type === 'text' && (
                <div className="space-y-2">
                  <textarea
                    rows={block.isQuote ? 2 : 3}
                    value={block.content || ''}
                    onChange={(e) => handleUpdateBlock(idx, { content: e.target.value })}
                    placeholder="Enter instructions, notes or contract text..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={block.isQuote || false}
                        onChange={(e) => handleUpdateBlock(idx, { isQuote: e.target.checked })}
                        className="rounded bg-slate-800 border-slate-700 text-blue-600"
                      />
                      <span>Style as Legal Disclaimer / Callout Quote</span>
                    </label>
                  </div>
                </div>
              )}

              {block.type === 'divider' && (
                <div className="py-2 flex items-center justify-center">
                  <div className="w-full border-t border-slate-800 border-dashed" />
                </div>
              )}

              {block.type === 'field' && block.field && (
                <div className="space-y-3">
                  {/* Field Label & Required Toggle */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        Question Label
                      </label>
                      <input
                        type="text"
                        value={block.field.label || ''}
                        onChange={(e) => handleUpdateField(idx, { label: e.target.value })}
                        placeholder="e.g. Full Legal Name"
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        Field Key ID
                      </label>
                      <input
                        type="text"
                        value={block.field.id || ''}
                        onChange={(e) => handleUpdateField(idx, { id: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-emerald-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Options (if choice or select) */}
                  {(block.field.type === 'choice' || block.field.type === 'select') && (
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        Options (comma-separated list)
                      </label>
                      <input
                        type="text"
                        value={block.field.options?.join(', ') || ''}
                        onChange={(e) =>
                          handleUpdateField(idx, {
                            options: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                          })
                        }
                        placeholder="e.g. Red, Green, Blue"
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                      />
                    </div>
                  )}

                  {/* Display style (choice only): chips, checkboxes, or radio buttons */}
                  {block.field.type === 'choice' && (
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        Display As
                      </label>
                      <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-700 w-fit">
                        {(['chips', 'checkbox', 'radio'] as const).map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => handleUpdateField(idx, { style: s })}
                            className={`px-2.5 py-1 text-[11px] font-medium rounded-md cursor-pointer transition-colors ${
                              (block.field!.style || 'chips') === s
                                ? 'bg-blue-600 text-white'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {s === 'chips' ? 'Chips' : s === 'checkbox' ? 'Checkboxes' : 'Radio'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Attributes Bar: Required, Placeholder */}
                  <div className="flex flex-wrap items-center justify-between pt-1 gap-2">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={block.field.required || false}
                          onChange={(e) => handleUpdateField(idx, { required: e.target.checked })}
                          className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="font-medium text-rose-300">Mandatory / Required</span>
                      </label>

                      {block.field.type === 'choice' && (
                        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={block.field.multiple || false}
                            onChange={(e) => handleUpdateField(idx, { multiple: e.target.checked })}
                            className="rounded bg-slate-800 border-slate-700 text-blue-600"
                          />
                          <span>Allow Multiple Answers</span>
                        </label>
                      )}
                    </div>

                    <span className="text-[11px] font-mono text-slate-500">
                      Token: &#123;&#123;{block.field.type}:{block.field.id}&#125;&#125;
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add New Block Buttons */}
      <div className="p-4 bg-slate-900 border border-dashed border-slate-700 rounded-2xl flex flex-wrap items-center justify-center gap-3">
        <Button
          variant="default"
          size="sm"
          onClick={onOpenFieldModal}
          className="bg-blue-600 hover:bg-blue-500 text-xs shadow-md shadow-blue-600/20"
        >
          <Sparkles className="w-3.5 h-3.5 mr-1" />
          + Add Typeform Field
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleAddHeading}
          className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300"
        >
          <Heading className="w-3.5 h-3.5 mr-1" />
          + Add Section Header
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleAddText}
          className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300"
        >
          <AlignLeft className="w-3.5 h-3.5 mr-1" />
          + Add Text / Disclaimer
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleAddDivider}
          className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300"
        >
          <Minus className="w-3.5 h-3.5 mr-1" />
          + Add Divider
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleAddYesNo}
          className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300"
        >
          <ToggleLeft className="w-3.5 h-3.5 mr-1" />
          + Add Yes/No Toggle
        </Button>
      </div>
    </div>
  );
};
