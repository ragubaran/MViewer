import React, { useState } from 'react';
import type { FormFieldConfig, FormDataValue } from '../../types/form';
import { SignaturePadModal } from './SignaturePadModal';
import {
  Star,
  Heart,
  ThumbsUp,
  Check,
  Calendar,
  Mail,
  Phone,
  Globe,
  PenTool,
  Upload,
  FileText,
  X,
} from 'lucide-react';

interface FormFieldRendererProps {
  field: FormFieldConfig;
  value: FormDataValue;
  onChange: (fieldId: string, value: FormDataValue) => void;
  highlight?: boolean;
}

export const FormFieldRenderer: React.FC<FormFieldRendererProps> = ({
  field,
  value,
  onChange,
  highlight = false,
}) => {
  const [isSigModalOpen, setIsSigModalOpen] = useState(false);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const baseInputStyle = `pdf-field-box transition-all rounded-md px-3 py-1.5 text-sm bg-white border text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
    highlight
      ? 'bg-blue-50/70 border-blue-300 ring-1 ring-blue-200'
      : 'border-slate-300 hover:border-slate-400'
  }`;

  // 1. Text / Email / Phone / URL / Number / Currency
  if (['text', 'email', 'phone', 'url', 'number', 'currency'].includes(field.type)) {
    const isCurrency = field.type === 'currency';
    const isNumber = field.type === 'number' || isCurrency;

    return (
      <div className="inline-flex flex-col my-1 max-w-full">
        {field.label && (
          <label className="text-xs font-semibold text-slate-700 mb-0.5 flex items-center gap-1">
            {field.label}
            {field.required && <span className="text-rose-500">*</span>}
          </label>
        )}
        <div className="relative inline-flex items-center">
          {field.prefix && (
            <span className="absolute left-2.5 text-slate-500 text-xs font-semibold pointer-events-none">
              {field.prefix}
            </span>
          )}
          {field.type === 'email' && !field.prefix && (
            <Mail className="absolute left-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          )}
          {field.type === 'phone' && !field.prefix && (
            <Phone className="absolute left-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          )}
          {field.type === 'url' && !field.prefix && (
            <Globe className="absolute left-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          )}

          <input
            type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : 'text'}
            value={value !== null && value !== undefined ? String(value) : ''}
            placeholder={field.placeholder || (isCurrency ? '0.00' : 'Type here...')}
            onChange={(e) => onChange(field.id, isNumber && e.target.value !== '' ? Number(e.target.value) : e.target.value)}
            className={`${baseInputStyle} ${
              field.prefix || ['email', 'phone', 'url'].includes(field.type) ? 'pl-7' : ''
            } ${field.suffix ? 'pr-12' : ''} min-w-[220px]`}
          />

          {field.suffix && (
            <span className="absolute right-2.5 text-slate-500 text-xs font-medium pointer-events-none">
              {field.suffix}
            </span>
          )}
        </div>
        {field.helpText && <span className="text-[11px] text-slate-500 mt-0.5">{field.helpText}</span>}
      </div>
    );
  }

  // 2. Textarea
  if (field.type === 'textarea') {
    return (
      <div className="flex flex-col my-2 w-full">
        {field.label && (
          <label className="text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
            {field.label}
            {field.required && <span className="text-rose-500">*</span>}
          </label>
        )}
        <textarea
          rows={field.rows || 3}
          value={value !== null && value !== undefined ? String(value) : ''}
          placeholder={field.placeholder || 'Enter response here...'}
          onChange={(e) => onChange(field.id, e.target.value)}
          className={`${baseInputStyle} w-full resize-y font-normal`}
        />
        {field.helpText && <span className="text-[11px] text-slate-500 mt-0.5">{field.helpText}</span>}
      </div>
    );
  }

  // 3. Choice (Chips, Radio, Checkbox, Multiple)
  if (field.type === 'choice') {
    const options = field.options || ['Option 1', 'Option 2'];
    const isMultiple = field.multiple;
    const selectedList: string[] = Array.isArray(value)
      ? value
      : typeof value === 'string' && value
      ? [value]
      : [];

    const handleToggle = (opt: string) => {
      if (isMultiple) {
        if (selectedList.includes(opt)) {
          onChange(field.id, selectedList.filter((x) => x !== opt));
        } else {
          onChange(field.id, [...selectedList, opt]);
        }
      } else {
        onChange(field.id, opt);
      }
    };

    return (
      <div className="flex flex-col my-2 w-full">
        {field.label && (
          <label className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
            {field.label}
            {field.required && <span className="text-rose-500">*</span>}
            {isMultiple && <span className="text-[11px] text-slate-500 font-normal">(Select all that apply)</span>}
          </label>
        )}
        <div className="flex flex-wrap gap-2">
          {options.map((opt, idx) => {
            const isSelected = selectedList.includes(opt);
            const keyBadge = String.fromCharCode(65 + idx); // A, B, C...

            return (
              <button
                key={opt}
                type="button"
                onClick={() => handleToggle(opt)}
                className={`pdf-field-box px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-2 transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : highlight
                    ? 'bg-blue-50/80 text-slate-800 border-blue-200 hover:bg-blue-100/80'
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100 hover:border-slate-400'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded text-[10px] font-bold flex items-center justify-center ${
                    isSelected ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {keyBadge}
                </span>
                <span>{opt}</span>
                {isSelected && <Check className="w-3.5 h-3.5 ml-0.5" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // 4. Select Dropdown
  if (field.type === 'select') {
    const options = field.options || [];
    return (
      <div className="inline-flex flex-col my-1">
        {field.label && (
          <label className="text-xs font-semibold text-slate-700 mb-0.5 flex items-center gap-1">
            {field.label}
            {field.required && <span className="text-rose-500">*</span>}
          </label>
        )}
        <select
          value={value !== null && value !== undefined ? String(value) : ''}
          onChange={(e) => onChange(field.id, e.target.value)}
          className={`${baseInputStyle} min-w-[200px] cursor-pointer`}
        >
          <option value="">{field.placeholder || 'Select an option...'}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // 5. Yes / No (Typeform Style)
  if (field.type === 'yesno') {
    const boolVal = typeof value === 'boolean' ? value : value === 'true' ? true : value === 'false' ? false : null;

    return (
      <div className="flex flex-col my-2">
        {field.label && (
          <label className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
            {field.label}
            {field.required && <span className="text-rose-500">*</span>}
          </label>
        )}
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={() => onChange(field.id, true)}
            className={`pdf-field-box px-4 py-2 rounded-lg text-xs font-semibold border flex items-center gap-2 cursor-pointer transition-all ${
              boolVal === true
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : highlight
                ? 'bg-blue-50 text-slate-700 border-blue-200 hover:bg-blue-100'
                : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <span className={`w-4 h-4 rounded text-[10px] font-bold flex items-center justify-center ${
              boolVal === true ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-600'
            }`}>Y</span>
            <span>Yes</span>
            {boolVal === true && <Check className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => onChange(field.id, false)}
            className={`pdf-field-box px-4 py-2 rounded-lg text-xs font-semibold border flex items-center gap-2 cursor-pointer transition-all ${
              boolVal === false
                ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                : highlight
                ? 'bg-blue-50 text-slate-700 border-blue-200 hover:bg-blue-100'
                : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <span className={`w-4 h-4 rounded text-[10px] font-bold flex items-center justify-center ${
              boolVal === false ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-600'
            }`}>N</span>
            <span>No</span>
            {boolVal === false && <Check className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    );
  }

  // 6. Rating (Star / Heart / Thumbs)
  if (field.type === 'rating') {
    const max = field.max || 5;
    const currentRating = typeof value === 'number' ? value : Number(value) || 0;
    const displayRating = hoverRating !== null ? hoverRating : currentRating;

    return (
      <div className="flex flex-col my-2">
        {field.label && (
          <label className="text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
            {field.label}
            {field.required && <span className="text-rose-500">*</span>}
          </label>
        )}
        <div className="flex items-center gap-1.5 py-1">
          {Array.from({ length: max }).map((_, i) => {
            const starNum = i + 1;
            const isFilled = starNum <= displayRating;

            return (
              <button
                key={starNum}
                type="button"
                onMouseEnter={() => setHoverRating(starNum)}
                onMouseLeave={() => setHoverRating(null)}
                onClick={() => onChange(field.id, starNum)}
                className="p-1 rounded-md transition-transform hover:scale-125 focus:outline-none cursor-pointer"
              >
                {field.icon === 'heart' ? (
                  <Heart
                    className={`w-6 h-6 transition-colors ${
                      isFilled ? 'fill-rose-500 text-rose-500' : 'text-slate-300 hover:text-slate-400'
                    }`}
                  />
                ) : field.icon === 'thumb' ? (
                  <ThumbsUp
                    className={`w-6 h-6 transition-colors ${
                      isFilled ? 'fill-blue-500 text-blue-500' : 'text-slate-300 hover:text-slate-400'
                    }`}
                  />
                ) : (
                  <Star
                    className={`w-6 h-6 transition-colors ${
                      isFilled ? 'fill-amber-400 text-amber-400' : 'text-slate-300 hover:text-slate-400'
                    }`}
                  />
                )}
              </button>
            );
          })}
          {currentRating > 0 && (
            <span className="ml-2 text-xs font-bold text-slate-600">
              {currentRating} / {max}
            </span>
          )}
        </div>
      </div>
    );
  }

  // 7. Scale (NPS 0-10 or 1-10)
  if (field.type === 'scale') {
    const min = field.min !== undefined ? field.min : 0;
    const max = field.max !== undefined ? field.max : 10;
    const currentVal = value !== null && value !== undefined && value !== '' ? Number(value) : null;
    const count = max - min + 1;

    return (
      <div className="flex flex-col my-2 w-full">
        {field.label && (
          <label className="text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
            {field.label}
            {field.required && <span className="text-rose-500">*</span>}
          </label>
        )}
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {Array.from({ length: count }).map((_, i) => {
            const num = min + i;
            const isSelected = currentVal === num;

            return (
              <button
                key={num}
                type="button"
                onClick={() => onChange(field.id, num)}
                className={`pdf-field-box w-8 h-9 rounded-md text-xs font-bold border flex items-center justify-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs scale-105'
                    : highlight
                    ? 'bg-blue-50 text-slate-700 border-blue-200 hover:bg-blue-100'
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {num}
              </button>
            );
          })}
        </div>
        {(field.lowLabel || field.highLabel) && (
          <div className="flex justify-between text-[11px] text-slate-500 font-medium px-0.5 mt-0.5">
            <span>{field.lowLabel}</span>
            <span>{field.highLabel}</span>
          </div>
        )}
      </div>
    );
  }

  // 8. Slider
  if (field.type === 'slider') {
    const min = field.min !== undefined ? field.min : 0;
    const max = field.max !== undefined ? field.max : 100;
    const step = field.step || 1;
    const currentVal = value !== null && value !== undefined && value !== '' ? Number(value) : min;

    return (
      <div className="flex flex-col my-2 max-w-md">
        <div className="flex justify-between items-center mb-1">
          {field.label && (
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              {field.label}
              {field.required && <span className="text-rose-500">*</span>}
            </label>
          )}
          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            {currentVal} {field.unit || ''}
          </span>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentVal}
          onChange={(e) => onChange(field.id, Number(e.target.value))}
          className="w-full accent-blue-600 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
          <span>{min}{field.unit}</span>
          <span>{max}{field.unit}</span>
        </div>
      </div>
    );
  }

  // 9. Date Picker
  if (field.type === 'date') {
    return (
      <div className="inline-flex flex-col my-1">
        {field.label && (
          <label className="text-xs font-semibold text-slate-700 mb-0.5 flex items-center gap-1">
            {field.label}
            {field.required && <span className="text-rose-500">*</span>}
          </label>
        )}
        <div className="relative inline-flex items-center">
          <Calendar className="absolute left-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            type="date"
            value={value !== null && value !== undefined ? String(value) : ''}
            onChange={(e) => onChange(field.id, e.target.value)}
            className={`${baseInputStyle} pl-8 min-w-[190px]`}
          />
        </div>
      </div>
    );
  }

  // 10. Legal Consent
  if (field.type === 'legal') {
    const isChecked = Boolean(value);

    return (
      <div className="my-3 p-3 rounded-lg border border-slate-200 bg-slate-50/70">
        <label className="flex items-start gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => onChange(field.id, e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <div className="flex-1">
            <span className="text-xs font-medium text-slate-800 leading-snug">
              {field.label || 'I acknowledge and agree to the legal terms specified.'}
              {field.required && <span className="text-rose-500 ml-1 font-bold">*</span>}
            </span>
          </div>
        </label>
      </div>
    );
  }

  // 11. Digital Signature
  if (field.type === 'signature') {
    const hasSig = typeof value === 'string' && value.startsWith('data:image');

    return (
      <div className="flex flex-col my-3">
        {field.label && (
          <label className="text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
            {field.label}
            {field.required && <span className="text-rose-500">*</span>}
          </label>
        )}

        <div className="relative inline-block">
          {hasSig ? (
            <div className="relative inline-block border-2 border-slate-300 bg-white rounded-lg p-2 shadow-xs group">
              <img
                src={String(value)}
                alt="Captured Signature"
                className="h-16 w-auto max-w-[280px] object-contain"
              />
              <button
                type="button"
                onClick={() => setIsSigModalOpen(true)}
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-slate-900 text-white p-1 rounded-md text-xs flex items-center gap-1 transition-opacity cursor-pointer"
              >
                <PenTool className="w-3 h-3" />
                Change
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsSigModalOpen(true)}
              className={`pdf-field-box px-4 py-3 rounded-lg border-2 border-dashed flex items-center gap-2.5 text-xs font-semibold cursor-pointer transition-all ${
                highlight
                  ? 'bg-blue-50 border-blue-400 text-blue-700'
                  : 'bg-slate-50 border-slate-300 text-slate-600 hover:bg-slate-100 hover:border-slate-400'
              }`}
            >
              <PenTool className="w-4 h-4 text-blue-600" />
              <span>Click to Add Digital Signature</span>
            </button>
          )}
        </div>

        <SignaturePadModal
          isOpen={isSigModalOpen}
          onClose={() => setIsSigModalOpen(false)}
          onSave={(dataUrl) => onChange(field.id, dataUrl)}
          initialSignature={hasSig ? String(value) : undefined}
        />
      </div>
    );
  }

  // 12. File Attachment
  if (field.type === 'file') {
    const fileObj = typeof value === 'object' && value !== null ? (value as { name: string; size?: number }) : null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onChange(field.id, {
          name: file.name,
          size: file.size,
          type: file.type,
        });
      }
    };

    return (
      <div className="flex flex-col my-2">
        {field.label && (
          <label className="text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
            {field.label}
            {field.required && <span className="text-rose-500">*</span>}
          </label>
        )}

        {fileObj ? (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 max-w-md">
            <FileText className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-medium truncate">{fileObj.name}</span>
            {fileObj.size && (
              <span className="text-[10px] text-blue-600 shrink-0">
                ({(fileObj.size / 1024).toFixed(1)} KB)
              </span>
            )}
            <button
              type="button"
              onClick={() => onChange(field.id, null)}
              className="ml-auto text-slate-400 hover:text-rose-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <label className={`pdf-field-box inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed text-xs font-medium cursor-pointer transition-all max-w-fit ${
            highlight ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-slate-50 border-slate-300 text-slate-600 hover:bg-slate-100'
          }`}>
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            <span>Upload Document ({field.accept || 'PDF, DOCX'})</span>
            <input
              type="file"
              accept={field.accept}
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        )}
      </div>
    );
  }

  return null;
};
