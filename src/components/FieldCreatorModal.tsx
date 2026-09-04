import React, { useState } from 'react';
import type { FieldType } from '../types/form';
import { Button } from './ui/Button';
import {
  Type,
  AlignLeft,
  CheckSquare,
  ChevronDown,
  ToggleLeft,
  Star,
  Sliders,
  Calendar,
  DollarSign,
  ShieldCheck,
  PenTool,
  Paperclip,
  X,
  Plus,
  Layers,
  Sparkles,
  Hash,
  Mail,
  Phone,
  Globe,
} from 'lucide-react';

interface FieldCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertField: (tokenString: string) => void;
}

interface FieldTypeDefinition {
  type: FieldType;
  category: 'text' | 'choice' | 'rating' | 'date' | 'legal' | 'file';
  title: string;
  description: string;
  icon: React.ElementType;
  defaultLabel: string;
  defaultAttrs: Record<string, unknown>;
}

const FIELD_CATALOG: FieldTypeDefinition[] = [
  // Text & Input
  {
    type: 'text',
    category: 'text',
    title: 'Short Text',
    description: 'Single-line text for names, titles, or short answers.',
    icon: Type,
    defaultLabel: 'Full Name',
    defaultAttrs: { placeholder: 'e.g. Jane Doe' },
  },
  {
    type: 'email',
    category: 'text',
    title: 'Email Address',
    description: 'Validates standard email format with mail icon.',
    icon: Mail,
    defaultLabel: 'Email Address',
    defaultAttrs: { placeholder: 'name@example.com' },
  },
  {
    type: 'phone',
    category: 'text',
    title: 'Phone Number',
    description: 'Telephone number with international dial format.',
    icon: Phone,
    defaultLabel: 'Mobile Phone',
    defaultAttrs: { placeholder: '+1 (555) 000-0000' },
  },
  {
    type: 'url',
    category: 'text',
    title: 'Website / URL',
    description: 'Validates website links and portfolio URLs.',
    icon: Globe,
    defaultLabel: 'Website or Portfolio',
    defaultAttrs: { placeholder: 'https://example.com' },
  },
  {
    type: 'number',
    category: 'text',
    title: 'Number',
    description: 'Only accepts numerical values with min/max bounds.',
    icon: Hash,
    defaultLabel: 'Age / Quantity',
    defaultAttrs: { min: 0, max: 100 },
  },
  {
    type: 'currency',
    category: 'text',
    title: 'Currency / Payment',
    description: 'Monetary values with currency symbols and decimals.',
    icon: DollarSign,
    defaultLabel: 'Proposed Fee',
    defaultAttrs: { prefix: '$', suffix: 'USD', placeholder: '150.00' },
  },
  {
    type: 'textarea',
    category: 'text',
    title: 'Long Text / Paragraph',
    description: 'Multi-line expanded textarea for detailed responses.',
    icon: AlignLeft,
    defaultLabel: 'Additional Comments',
    defaultAttrs: { rows: 3, placeholder: 'Type your message here...' },
  },

  // Choices & Selection
  {
    type: 'choice',
    category: 'choice',
    title: 'Multiple Choice',
    description: 'Selectable interactive chips or checkbox buttons.',
    icon: CheckSquare,
    defaultLabel: 'Preferred Option',
    defaultAttrs: { options: 'Option A, Option B, Option C', multiple: true, style: 'chips' },
  },
  {
    type: 'select',
    category: 'choice',
    title: 'Dropdown Menu',
    description: 'Compact dropdown list for choosing from many options.',
    icon: ChevronDown,
    defaultLabel: 'Department / Category',
    defaultAttrs: { options: 'Engineering, Marketing, Legal, Operations', placeholder: 'Select...' },
  },
  {
    type: 'yesno',
    category: 'choice',
    title: 'Yes / No Choice',
    description: 'Typeform-style binary decision buttons [Y] / [N].',
    icon: ToggleLeft,
    defaultLabel: 'Do you agree to the terms?',
    defaultAttrs: {},
  },

  // Ratings & Scales
  {
    type: 'rating',
    category: 'rating',
    title: 'Star Rating',
    description: 'Visual 1 to 5 star rating with interactive hover glow.',
    icon: Star,
    defaultLabel: 'Overall Satisfaction',
    defaultAttrs: { max: 5, icon: 'star' },
  },
  {
    type: 'scale',
    category: 'rating',
    title: 'Opinion Scale (NPS 0-10)',
    description: 'Net Promoter Score rating from 0 to 10 with endpoints.',
    icon: Layers,
    defaultLabel: 'How likely are you to recommend us?',
    defaultAttrs: { min: 0, max: 10, lowLabel: 'Not at all likely', highLabel: 'Extremely likely' },
  },
  {
    type: 'slider',
    category: 'rating',
    title: 'Range Slider',
    description: 'Continuous smooth draggable slider with live readout.',
    icon: Sliders,
    defaultLabel: 'Budget Estimation',
    defaultAttrs: { min: 0, max: 100, step: 5, unit: '%' },
  },

  // Date
  {
    type: 'date',
    category: 'date',
    title: 'Date Picker',
    description: 'Interactive calendar date picker input.',
    icon: Calendar,
    defaultLabel: 'Effective Date',
    defaultAttrs: {},
  },

  // Legal & Security
  {
    type: 'legal',
    category: 'legal',
    title: 'Legal / Terms Checkbox',
    description: 'Mandatory legal agreement and disclaimer checkbox.',
    icon: ShieldCheck,
    defaultLabel: 'I acknowledge and agree to the Terms of Service',
    defaultAttrs: { required: true },
  },
  {
    type: 'signature',
    category: 'legal',
    title: 'Digital Signature Pad',
    description: 'HTML5 Canvas drawing pad or typed cursive signature.',
    icon: PenTool,
    defaultLabel: 'Authorized Signature',
    defaultAttrs: { required: true },
  },

  // File
  {
    type: 'file',
    category: 'file',
    title: 'File Upload',
    description: 'Document attachment picker (PDF, DOCX, etc.).',
    icon: Paperclip,
    defaultLabel: 'Upload Document / Resume',
    defaultAttrs: { accept: '.pdf,.docx,.txt' },
  },
];

export const FieldCreatorModal: React.FC<FieldCreatorModalProps> = ({
  isOpen,
  onClose,
  onInsertField,
}) => {
  const [selectedType, setSelectedType] = useState<FieldTypeDefinition>(FIELD_CATALOG[0]);
  const [fieldId, setFieldId] = useState('full_name');
  const [label, setLabel] = useState('Full Name');
  const [placeholder, setPlaceholder] = useState('e.g. Jane Doe');
  const [required, setRequired] = useState(false);
  const [optionsStr, setOptionsStr] = useState('Option A, Option B, Option C');
  const [multiple, setMultiple] = useState(false);
  const [minVal, setMinVal] = useState(0);
  const [maxVal, setMaxVal] = useState(10);
  const [lowLabel, setLowLabel] = useState('Not likely');
  const [highLabel, setHighLabel] = useState('Extremely likely');
  const [unit, setUnit] = useState('%');
  const [prefix, setPrefix] = useState('$');
  const [suffix, setSuffix] = useState('USD');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  if (!isOpen) return null;

  const handleSelectDefinition = (def: FieldTypeDefinition) => {
    setSelectedType(def);
    setLabel(def.defaultLabel);
    const autoId = def.defaultLabel
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .slice(0, 20);
    setFieldId(autoId);

    setPlaceholder((def.defaultAttrs.placeholder as string) || '');
    setRequired(Boolean(def.defaultAttrs.required));
    if (def.defaultAttrs.options) {
      setOptionsStr(String(def.defaultAttrs.options));
    }
    if (def.defaultAttrs.multiple !== undefined) {
      setMultiple(Boolean(def.defaultAttrs.multiple));
    }
    if (def.defaultAttrs.min !== undefined) setMinVal(Number(def.defaultAttrs.min));
    if (def.defaultAttrs.max !== undefined) setMaxVal(Number(def.defaultAttrs.max));
    if (def.defaultAttrs.lowLabel) setLowLabel(String(def.defaultAttrs.lowLabel));
    if (def.defaultAttrs.highLabel) setHighLabel(String(def.defaultAttrs.highLabel));
    if (def.defaultAttrs.unit) setUnit(String(def.defaultAttrs.unit));
    if (def.defaultAttrs.prefix) setPrefix(String(def.defaultAttrs.prefix));
    if (def.defaultAttrs.suffix) setSuffix(String(def.defaultAttrs.suffix));
  };

  const handleInsert = () => {
    const parts: string[] = [`{{${selectedType.type}:${fieldId}`];

    if (label) parts.push(`label="${label}"`);
    if (required) parts.push(`required=true`);
    if (placeholder) parts.push(`placeholder="${placeholder}"`);

    if (selectedType.type === 'choice' || selectedType.type === 'select') {
      if (optionsStr) parts.push(`options="${optionsStr}"`);
      if (selectedType.type === 'choice' && multiple) parts.push(`multiple=true`);
    }

    if (selectedType.type === 'scale') {
      parts.push(`min=${minVal}`);
      parts.push(`max=${maxVal}`);
      if (lowLabel) parts.push(`lowLabel="${lowLabel}"`);
      if (highLabel) parts.push(`highLabel="${highLabel}"`);
    }

    if (selectedType.type === 'rating') {
      parts.push(`max=${maxVal || 5}`);
    }

    if (selectedType.type === 'slider') {
      parts.push(`min=${minVal}`);
      parts.push(`max=${maxVal}`);
      if (unit) parts.push(`unit="${unit}"`);
    }

    if (selectedType.type === 'currency') {
      if (prefix) parts.push(`prefix="${prefix}"`);
      if (suffix) parts.push(`suffix="${suffix}"`);
    }

    const token = parts.join(' ') + '}}';
    onInsertField(token);
    onClose();
  };

  const filteredCatalog = activeCategory === 'all'
    ? FIELD_CATALOG
    : FIELD_CATALOG.filter((f) => f.category === activeCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-4xl h-[640px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Insert Typeform-Style Field
              </h3>
              <p className="text-xs text-slate-400">
                Choose any field type, customize its properties, and insert into your template.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body (Catalog on left, Config on right) */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Field Catalog */}
          <div className="w-5/12 border-r border-slate-800 flex flex-col bg-slate-950/50">
            {/* Filter Pills */}
            <div className="p-3 border-b border-slate-800 flex flex-wrap gap-1.5 shrink-0">
              {['all', 'text', 'choice', 'rating', 'date', 'legal'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-md capitalize cursor-pointer transition-colors ${
                    activeCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
              {filteredCatalog.map((def) => {
                const IconComponent = def.icon;
                const isSelected = selectedType.type === def.type;

                return (
                  <button
                    key={def.type}
                    onClick={() => handleSelectDefinition(def)}
                    className={`w-full text-left p-2.5 rounded-xl flex items-start gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600/15 border border-blue-500/50 text-white shadow-xs'
                        : 'border border-transparent text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold">{def.title}</span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {def.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {def.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Configuration & Preview */}
          <div className="w-7/12 p-6 overflow-y-auto flex flex-col space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <selectedType.icon className="w-5 h-5 text-blue-400" />
              <h4 className="text-sm font-semibold text-white">
                Configure {selectedType.title}
              </h4>
            </div>

            {/* Field ID and Label */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Unique Field ID <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={fieldId}
                  onChange={(e) => setFieldId(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Display Label / Question
                </label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Placeholder & Required */}
            <div className="grid grid-cols-2 gap-3 items-center">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Placeholder Text
                </label>
                <input
                  type="text"
                  value={placeholder}
                  onChange={(e) => setPlaceholder(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="pt-4">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={required}
                    onChange={(e) => setRequired(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs font-medium text-slate-300">
                    Mandatory / Required Field
                  </span>
                </label>
              </div>
            </div>

            {/* Choice specific settings */}
            {(selectedType.type === 'choice' || selectedType.type === 'select') && (
              <div className="space-y-3 p-3 rounded-lg bg-slate-800/40 border border-slate-800">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Options (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={optionsStr}
                    onChange={(e) => setOptionsStr(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                {selectedType.type === 'choice' && (
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={multiple}
                      onChange={(e) => setMultiple(e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-blue-600"
                    />
                    <span className="text-xs font-medium text-slate-300">
                      Allow Multiple Selections (Multi-Choice)
                    </span>
                  </label>
                )}
              </div>
            )}

            {/* Scale & Rating settings */}
            {(selectedType.type === 'scale' || selectedType.type === 'slider') && (
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-800/40 border border-slate-800">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Minimum</label>
                  <input
                    type="number"
                    value={minVal}
                    onChange={(e) => setMinVal(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Maximum</label>
                  <input
                    type="number"
                    value={maxVal}
                    onChange={(e) => setMaxVal(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
                {selectedType.type === 'scale' && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Low Label</label>
                      <input
                        type="text"
                        value={lowLabel}
                        onChange={(e) => setLowLabel(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">High Label</label>
                      <input
                        type="text"
                        value={highLabel}
                        onChange={(e) => setHighLabel(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Generated Directive Preview */}
            <div className="mt-auto pt-2">
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Generated Markdown Directive:
              </label>
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto">
                {`{{${selectedType.type}:${fieldId}${label ? ` label="${label}"` : ''}${required ? ' required=true' : ''}${placeholder ? ` placeholder="${placeholder}"` : ''}}}`}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-950 shrink-0">
          <span className="text-xs text-slate-500">
            Field will be inserted at your cursor position.
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="default" size="sm" onClick={handleInsert}>
              <Plus className="w-4 h-4 mr-1" />
              Insert Field Directive
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
