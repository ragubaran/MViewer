import type { FormFieldConfig } from '../types/form';
import { parseFieldDirective, FIELD_TOKEN_REGEX } from './parser';

export type VisualBlockType = 'heading' | 'text' | 'field' | 'divider';

export interface VisualBlock {
  id: string;
  type: VisualBlockType;
  // Heading properties
  level?: 1 | 2 | 3;
  headingText?: string;
  // Text & Narrative properties
  content?: string;
  isQuote?: boolean;
  // Form Field properties
  field?: FormFieldConfig;
}

/**
 * Parses markdown template body into an array of visual editable blocks.
 */
export function markdownToVisualBlocks(markdownBody: string): VisualBlock[] {
  const blocks: VisualBlock[] = [];
  const lines = markdownBody.split('\n');
  let textBuffer: string[] = [];

  const flushTextBuffer = () => {
    if (textBuffer.length === 0) return;
    const text = textBuffer.join('\n').trim();
    textBuffer = [];
    if (!text) return;

    // Check if the text contains field tokens
    const matches = text.match(FIELD_TOKEN_REGEX);
    if (matches && matches.length === 1 && text.trim() === matches[0]) {
      // Entire block is just one field directive
      const field = parseFieldDirective(matches[0]);
      if (field) {
        blocks.push({
          id: `field-${field.id}-${Math.random().toString(36).slice(2, 7)}`,
          type: 'field',
          field,
        });
        return;
      }
    }

    // Check if it's a quote / legal disclaimer
    const isQuote = text.startsWith('> ');
    const cleanContent = isQuote ? text.replace(/^>\s*/gm, '') : text;

    blocks.push({
      id: `text-${Math.random().toString(36).slice(2, 7)}`,
      type: 'text',
      content: cleanContent,
      isQuote,
    });
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check divider
    if (trimmed === '---' || trimmed === '***') {
      flushTextBuffer();
      blocks.push({
        id: `divider-${Math.random().toString(36).slice(2, 7)}`,
        type: 'divider',
      });
      continue;
    }

    // Check Headings
    if (trimmed.startsWith('# ')) {
      flushTextBuffer();
      blocks.push({
        id: `h1-${Math.random().toString(36).slice(2, 7)}`,
        type: 'heading',
        level: 1,
        headingText: trimmed.slice(2).trim(),
      });
      continue;
    }
    if (trimmed.startsWith('## ')) {
      flushTextBuffer();
      blocks.push({
        id: `h2-${Math.random().toString(36).slice(2, 7)}`,
        type: 'heading',
        level: 2,
        headingText: trimmed.slice(3).trim(),
      });
      continue;
    }
    if (trimmed.startsWith('### ')) {
      flushTextBuffer();
      blocks.push({
        id: `h3-${Math.random().toString(36).slice(2, 7)}`,
        type: 'heading',
        level: 3,
        headingText: trimmed.slice(4).trim(),
      });
      continue;
    }

    // Check standalone field line (e.g. - **Name:** {{input:name ...}} or {{signature:sig ...}})
    const fieldMatch = trimmed.match(FIELD_TOKEN_REGEX);
    if (fieldMatch && (trimmed.startsWith('{{') || trimmed.startsWith('- ') || trimmed.startsWith('* '))) {
      // If line contains a field directive, parse the field
      const fieldToken = fieldMatch[0];
      const fieldConfig = parseFieldDirective(fieldToken);

      if (fieldConfig) {
        flushTextBuffer();

        // If line has a bullet label like "- **Full Name:** {{input:name ...}}", extract label if missing
        if ((trimmed.startsWith('- ') || trimmed.startsWith('* ')) && !fieldConfig.label) {
          const prefix = trimmed.substring(2, trimmed.indexOf('{{')).replace(/\*+/g, '').replace(/:/g, '').trim();
          if (prefix) fieldConfig.label = prefix;
        }

        blocks.push({
          id: `field-${fieldConfig.id}-${Math.random().toString(36).slice(2, 7)}`,
          type: 'field',
          field: fieldConfig,
        });
        continue;
      }
    }

    if (trimmed === '') {
      flushTextBuffer();
    } else {
      textBuffer.push(line);
    }
  }

  flushTextBuffer();
  return blocks;
}

/**
 * Converts visual blocks back into canonical Markdown template text.
 */
export function visualBlocksToMarkdown(blocks: VisualBlock[]): string {
  const parts: string[] = [];

  for (const block of blocks) {
    if (block.type === 'heading') {
      const hashes = '#'.repeat(block.level || 1);
      parts.push(`${hashes} ${block.headingText || 'Section'}\n`);
    } else if (block.type === 'divider') {
      parts.push('---\n');
    } else if (block.type === 'text') {
      if (block.isQuote) {
        const quoted = (block.content || '')
          .split('\n')
          .map((l) => `> ${l}`)
          .join('\n');
        parts.push(`${quoted}\n`);
      } else {
        parts.push(`${block.content || ''}\n`);
      }
    } else if (block.type === 'field' && block.field) {
      const f = block.field;
      const attrs: string[] = [`{{${f.type}:${f.id}`];

      if (f.label) attrs.push(`label="${escapeAttr(f.label)}"`);
      if (f.required) attrs.push('required=true');
      if (f.placeholder) attrs.push(`placeholder="${escapeAttr(f.placeholder)}"`);
      if (f.helpText) attrs.push(`help="${escapeAttr(f.helpText)}"`);

      if (f.options && f.options.length > 0) {
        attrs.push(`options="${escapeAttr(f.options.join(', '))}"`);
      }
      if (f.multiple) attrs.push('multiple=true');
      if (f.style) attrs.push(`style="${f.style}"`);

      if (f.min !== undefined) attrs.push(`min=${f.min}`);
      if (f.max !== undefined) attrs.push(`max=${f.max}`);
      if (f.step !== undefined) attrs.push(`step=${f.step}`);
      if (f.unit) attrs.push(`unit="${escapeAttr(f.unit)}"`);
      if (f.prefix) attrs.push(`prefix="${escapeAttr(f.prefix)}"`);
      if (f.suffix) attrs.push(`suffix="${escapeAttr(f.suffix)}"`);
      if (f.lowLabel) attrs.push(`lowLabel="${escapeAttr(f.lowLabel)}"`);
      if (f.highLabel) attrs.push(`highLabel="${escapeAttr(f.highLabel)}"`);
      if (f.rows) attrs.push(`rows=${f.rows}`);
      if (f.accept) attrs.push(`accept="${escapeAttr(f.accept)}"`);

      const token = attrs.join(' ') + '}}';
      // Format nicely as a list item or standalone block
      if (f.type === 'signature' || f.type === 'legal' || f.type === 'scale' || f.type === 'choice') {
        parts.push(`${token}\n`);
      } else {
        parts.push(`- **${f.label || f.id}:** ${token}\n`);
      }
    }
  }

  return parts.join('\n').trim() + '\n';
}

function escapeAttr(str: string): string {
  return str.replace(/"/g, '\\"');
}
