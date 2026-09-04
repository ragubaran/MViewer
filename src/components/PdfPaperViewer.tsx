import React, { useMemo } from 'react';
import type { FormDocument, FormDataValue } from '../types/form';
import { parseFieldDirective, FIELD_TOKEN_REGEX } from '../utils/parser';
import { FormFieldRenderer } from './fields/FormFieldRenderer';
import { ShieldCheck, ShieldAlert, Shield, CheckCircle2, Lock } from 'lucide-react';

interface PdfPaperViewerProps {
  document: FormDocument;
  onFieldValueChange: (fieldId: string, value: FormDataValue) => void;
  highlightFields: boolean;
  zoom: number;
  onOpenSecurityModal: () => void;
}

export const PdfPaperViewer: React.FC<PdfPaperViewerProps> = ({
  document: doc,
  onFieldValueChange,
  highlightFields,
  zoom,
  onOpenSecurityModal,
}) => {
  // Calculate completion progress
  const progress = useMemo(() => {
    const requiredFields = doc.fields.filter((f) => f.required);
    if (requiredFields.length === 0) return { completed: 0, total: 0, percentage: 100 };

    const filledCount = requiredFields.filter((f) => {
      const val = doc.formData[f.id];
      return val !== null && val !== undefined && val !== '' && (Array.isArray(val) ? val.length > 0 : true);
    }).length;

    return {
      completed: filledCount,
      total: requiredFields.length,
      percentage: Math.round((filledCount / requiredFields.length) * 100),
    };
  }, [doc.fields, doc.formData]);

  // Helper to split markdown into blocks and render them
  const renderedContent = useMemo(() => {
    const lines = doc.templateBody.split('\n');
    const elements: React.ReactNode[] = [];
    let currentBlock: string[] = [];
    let inTable = false;
    let tableRows: string[][] = [];

    const flushCurrentBlock = (keyPrefix: string) => {
      if (currentBlock.length === 0) return;
      const text = currentBlock.join('\n').trim();
      currentBlock = [];
      if (!text) return;

      elements.push(
        <div key={`${keyPrefix}-${elements.length}`} className="my-2 text-slate-800 text-sm leading-relaxed">
          {renderInlineWithFields(text, doc, onFieldValueChange, highlightFields)}
        </div>
      );
    };

    const flushTable = (keyPrefix: string) => {
      if (tableRows.length === 0) return;
      const rows = [...tableRows];
      tableRows = [];
      inTable = false;

      const headerRow = rows[0];
      const bodyRows = rows.slice(2); // skip header and delimiter

      elements.push(
        <div key={`${keyPrefix}-table-${elements.length}`} className="my-3 overflow-x-auto">
          <table className="min-w-full text-xs text-left border border-slate-200 divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {headerRow.map((col, idx) => (
                  <th key={idx} className="px-3 py-2 font-semibold text-slate-700">
                    {renderInlineWithFields(col.trim(), doc, onFieldValueChange, highlightFields)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {bodyRows.map((row, rIdx) => (
                <tr key={rIdx}>
                  {row.map((col, cIdx) => (
                    <td key={cIdx} className="px-3 py-2 text-slate-700">
                      {renderInlineWithFields(col.trim(), doc, onFieldValueChange, highlightFields)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Check Table
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        flushCurrentBlock(`pre-table-${i}`);
        inTable = true;
        const cols = trimmed.slice(1, -1).split('|');
        tableRows.push(cols);
        continue;
      } else if (inTable) {
        flushTable(`table-end-${i}`);
      }

      // Headings
      if (trimmed.startsWith('# ')) {
        flushCurrentBlock(`h1-${i}`);
        elements.push(
          <h1 key={`h1-${i}`} className="text-2xl font-bold tracking-tight text-slate-900 mt-6 mb-3 border-b pb-2 border-slate-200">
            {renderInlineWithFields(trimmed.slice(2), doc, onFieldValueChange, highlightFields)}
          </h1>
        );
      } else if (trimmed.startsWith('## ')) {
        flushCurrentBlock(`h2-${i}`);
        elements.push(
          <h2 key={`h2-${i}`} className="text-xl font-bold tracking-tight text-slate-900 mt-5 mb-2 text-blue-950">
            {renderInlineWithFields(trimmed.slice(3), doc, onFieldValueChange, highlightFields)}
          </h2>
        );
      } else if (trimmed.startsWith('### ')) {
        flushCurrentBlock(`h3-${i}`);
        elements.push(
          <h3 key={`h3-${i}`} className="text-sm font-semibold uppercase tracking-wider text-slate-600 mt-4 mb-2">
            {renderInlineWithFields(trimmed.slice(4), doc, onFieldValueChange, highlightFields)}
          </h3>
        );
      } else if (trimmed.startsWith('> ')) {
        flushCurrentBlock(`quote-${i}`);
        elements.push(
          <blockquote key={`quote-${i}`} className="my-3 pl-3.5 border-l-3 border-blue-500 bg-blue-50/40 py-2 pr-3 rounded-r text-xs text-slate-700 italic">
            {renderInlineWithFields(trimmed.slice(2), doc, onFieldValueChange, highlightFields)}
          </blockquote>
        );
      } else if (trimmed.startsWith('---') || trimmed.startsWith('***')) {
        flushCurrentBlock(`hr-${i}`);
        elements.push(<hr key={`hr-${i}`} className="my-4 border-slate-200" />);
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        flushCurrentBlock(`li-${i}`);
        elements.push(
          <div key={`li-${i}`} className="flex items-start gap-2 my-1.5 text-sm text-slate-800">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
            <div className="flex-1">
              {renderInlineWithFields(trimmed.slice(2), doc, onFieldValueChange, highlightFields)}
            </div>
          </div>
        );
      } else if (trimmed === '') {
        flushCurrentBlock(`empty-${i}`);
      } else {
        currentBlock.push(line);
      }
    }

    if (inTable) flushTable('end-table');
    flushCurrentBlock('end');

    return elements;
  }, [doc.templateBody, doc.formData, highlightFields, onFieldValueChange]);

  return (
    <div className="w-full flex flex-col items-center py-6 px-4 select-text">
      {/* Zoom Container */}
      <div
        className="transition-transform duration-100 origin-top"
        style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
      >
        {/* PDF Paper Sheet */}
        <div
          className={`pdf-sheet w-[820px] min-h-[1120px] bg-white rounded-sm shadow-2xl p-12 relative flex flex-col border border-slate-200/80 ${
            highlightFields ? 'highlight-fields' : ''
          }`}
        >
          {/* Top PDF Sheet Header & Verification Seal */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-wider text-slate-700 uppercase text-[11px]">
                MVIEWER DOCUMENT
              </span>
              <span className="text-slate-300">|</span>
              <span className="font-mono text-[10px] text-slate-500">
                {doc.metadata.template_id || 'FORM-ID'}
              </span>
            </div>

            {/* Cryptographic Security Seal Badge */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={onOpenSecurityModal}>
              {doc.verification.status === 'verified' ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300/80 shadow-xs hover:bg-emerald-100 transition-colors">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-semibold text-[11px]">SHA-256 Verified Genuine</span>
                  <Lock className="w-3 h-3 text-emerald-600 ml-0.5" />
                </div>
              ) : doc.verification.status === 'tampered' ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-300 shadow-xs animate-pulse hover:bg-rose-100 transition-colors">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  <span className="font-bold text-[11px]">TAMPER DETECTED: Checksum Mismatch</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-300 shadow-xs hover:bg-amber-100 transition-colors">
                  <Shield className="w-3.5 h-3.5 text-amber-600" />
                  <span className="font-semibold text-[11px]">Unsealed Template</span>
                </div>
              )}
            </div>
          </div>

          {/* Tamper Warning Banner (if tampered) */}
          {doc.verification.status === 'tampered' && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border-2 border-rose-300 flex items-start gap-2.5 text-rose-900 text-xs">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">CRITICAL INTEGRITY VIOLATION:</strong>
                <p className="mt-0.5 text-rose-800 leading-snug">
                  This document's static template content, legal clauses, or questions have been altered outside of MViewer.
                  The embedded cryptographic SHA-256 seal failed validation. Data entered in this form cannot be certified.
                </p>
              </div>
            </div>
          )}

          {/* Form Completion Progress Bar */}
          {progress.total > 0 && (
            <div className="no-print mb-4 p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${progress.completed === progress.total ? 'text-emerald-600' : 'text-blue-600'}`} />
                <span className="font-medium text-slate-700">
                  {progress.completed} of {progress.total} required fields completed
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      progress.completed === progress.total ? 'bg-emerald-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
                <span className="font-bold text-slate-700 text-[11px] w-8 text-right">
                  {progress.percentage}%
                </span>
              </div>
            </div>
          )}

          {/* Main Document Content */}
          <div className="flex-1 form-content-area">
            {renderedContent}
          </div>

          {/* PDF Page Footer */}
          <div className="pt-8 mt-12 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <span>MViewer Secure Form v1.0</span>
              <span>•</span>
              <span className="font-mono">
                Checksum: {doc.metadata.template_checksum ? doc.metadata.template_checksum.substring(0, 18) + '...' : 'Unsealed'}
              </span>
            </div>
            <div>
              <span>Page 1 of 1</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Renders inline text, formatting bold/italic/code, and replacing {{field:...}} tokens with live inputs!
 */
function renderInlineWithFields(
  text: string,
  doc: FormDocument,
  onChange: (id: string, val: FormDataValue) => void,
  highlight: boolean
): React.ReactNode {
  if (!text) return null;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  const regex = new RegExp(FIELD_TOKEN_REGEX);
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Text before match
    if (match.index > lastIndex) {
      const sub = text.substring(lastIndex, match.index);
      parts.push(renderFormattedMarkdown(sub, `text-${lastIndex}`));
    }

    const fullToken = match[0];
    const fieldConfig = parseFieldDirective(fullToken);

    if (fieldConfig) {
      const currentVal = doc.formData[fieldConfig.id] !== undefined ? doc.formData[fieldConfig.id] : null;
      parts.push(
        <FormFieldRenderer
          key={`field-${fieldConfig.id}-${match.index}`}
          field={fieldConfig}
          value={currentVal}
          onChange={onChange}
          highlight={highlight}
        />
      );
    } else {
      parts.push(<span key={`raw-${match.index}`}>{fullToken}</span>);
    }

    lastIndex = regex.lastIndex;
  }

  // Trailing text
  if (lastIndex < text.length) {
    const sub = text.substring(lastIndex);
    parts.push(renderFormattedMarkdown(sub, `text-end`));
  }

  return <>{parts}</>;
}

/**
 * Simple markdown inline formatter (bold, italic, code).
 */
function renderFormattedMarkdown(text: string, keyPrefix: string): React.ReactNode {
  // Split on bold (**text**) or italic (*text*) or code (`text`)
  const tokenRegex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={`${keyPrefix}-b-${i}`} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={`${keyPrefix}-i-${i}`} className="italic text-slate-700">{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={`${keyPrefix}-c-${i}`} className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-800 font-mono text-xs border border-slate-200">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}
