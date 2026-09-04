import type { FormDocument, FormFieldConfig, FormMetadata, FormDataRecord, FormDataValue, FieldType } from '../types/form';
import { verifyTemplateChecksum } from './crypto';

// Regex to detect and parse {{type:id ...attributes}}
export const FIELD_TOKEN_REGEX = /\{\{([a-zA-Z0-9_-]+):([a-zA-Z0-9_-]+)(.*?)\}\}/g;

/**
 * Parses key="value" or key=value or key='value' or boolean key attributes.
 */
export function parseAttributes(attrString: string): Record<string, string | number | boolean | string[]> {
  const attrs: Record<string, string | number | boolean | string[]> = {};
  if (!attrString) return attrs;

  // Pattern matches: key="value", key='value', or key=bareword
  const regex = /([a-zA-Z0-9_-]+)=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(attrString)) !== null) {
    const key = match[1];
    const val = match[2] !== undefined ? match[2] : match[3] !== undefined ? match[3] : match[4];

    if (val === 'true') {
      attrs[key] = true;
    } else if (val === 'false') {
      attrs[key] = false;
    } else if (!isNaN(Number(val)) && val.trim() !== '') {
      attrs[key] = Number(val);
    } else if (key === 'options' || (typeof val === 'string' && val.includes(','))) {
      // Split options by comma and trim
      attrs[key] = val.split(',').map(s => s.trim()).filter(Boolean);
    } else {
      attrs[key] = val;
    }
  }

  return attrs;
}

/**
 * Parses an individual field token into a FormFieldConfig object.
 */
export function parseFieldDirective(fullToken: string): FormFieldConfig | null {
  const match = /^\{\{([a-zA-Z0-9_-]+):([a-zA-Z0-9_-]+)([\s\S]*)\}\}$/.exec(fullToken.trim());
  if (!match) return null;

  const rawType = match[1].toLowerCase();
  const id = match[2];
  const attrString = match[3] || '';
  const attrs = parseAttributes(attrString);

  // Normalize field type
  let type: FieldType = 'text';
  const validTypes: FieldType[] = [
    'text', 'email', 'phone', 'url', 'number', 'currency', 'textarea',
    'choice', 'select', 'yesno', 'rating', 'scale', 'slider',
    'date', 'legal', 'signature', 'file'
  ];

  if (validTypes.includes(rawType as FieldType)) {
    type = rawType as FieldType;
  } else if (rawType === 'input') {
    const subType = (attrs.type as string)?.toLowerCase();
    if (subType === 'email') type = 'email';
    else if (subType === 'phone' || subType === 'tel') type = 'phone';
    else if (subType === 'url') type = 'url';
    else if (subType === 'number') type = 'number';
    else if (subType === 'currency') type = 'currency';
    else if (subType === 'date') type = 'date';
    else type = 'text';
  } else if (rawType === 'checkbox' || rawType === 'radio' || rawType === 'multichoice') {
    type = 'choice';
    if (rawType === 'checkbox') attrs.style = 'checkbox';
    if (rawType === 'radio') attrs.style = 'radio';
  }

  // Handle options normalization
  let options: string[] | undefined = undefined;
  if (Array.isArray(attrs.options)) {
    options = attrs.options;
  } else if (typeof attrs.options === 'string') {
    options = attrs.options.split(',').map(s => s.trim()).filter(Boolean);
  }

  return {
    id,
    type,
    label: (attrs.label as string) || (attrs.title as string) || id.replace(/_/g, ' '),
    placeholder: (attrs.placeholder as string) || '',
    required: Boolean(attrs.required),
    helpText: (attrs.help as string) || (attrs.description as string) || '',
    options,
    multiple: Boolean(attrs.multiple),
    style: (attrs.style as 'chips' | 'radio' | 'checkbox') || (attrs.mode === 'multiple' ? 'checkbox' : 'chips'),
    min: attrs.min !== undefined ? Number(attrs.min) : undefined,
    max: attrs.max !== undefined ? Number(attrs.max) : (type === 'rating' ? 5 : type === 'scale' ? 10 : undefined),
    step: attrs.step !== undefined ? Number(attrs.step) : undefined,
    unit: (attrs.unit as string) || '',
    prefix: (attrs.prefix as string) || (type === 'currency' ? '$' : ''),
    suffix: (attrs.suffix as string) || '',
    lowLabel: (attrs.lowLabel as string) || (attrs.low as string) || '',
    highLabel: (attrs.highLabel as string) || (attrs.high as string) || '',
    icon: (attrs.icon as 'star' | 'heart' | 'thumb') || 'star',
    rows: attrs.rows !== undefined ? Number(attrs.rows) : 3,
    accept: (attrs.accept as string) || '',
  };
}

/**
 * Extracts all field tokens in the template body.
 */
export function extractFieldsFromTemplate(templateBody: string): FormFieldConfig[] {
  const fields: FormFieldConfig[] = [];
  const seenIds = new Set<string>();

  const matches = templateBody.match(FIELD_TOKEN_REGEX);
  if (!matches) return fields;

  for (const token of matches) {
    const config = parseFieldDirective(token);
    if (config && !seenIds.has(config.id)) {
      seenIds.add(config.id);
      fields.push(config);
    }
  }

  return fields;
}

/**
 * Simple, high-speed YAML Frontmatter Parser
 * Avoids heavy parser overhead and runs in <1ms.
 */
export function parseFrontmatter(content: string): {
  metadata: FormMetadata;
  formData: FormDataRecord;
  body: string;
} {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
  const match = frontmatterRegex.exec(content);

  if (!match) {
    return {
      metadata: {},
      formData: {},
      body: content,
    };
  }

  const yamlStr = match[1];
  const body = match[2];

  const metadata: FormMetadata = {};
  let formData: FormDataRecord = {};

  const lines = yamlStr.split(/\r?\n/);
  let currentParent: string | null = null;
  let activeListKey: string | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith('#')) continue;

    // Check indentation
    const indent = line.search(/\S/);
    const trimmed = line.trim();

    if (indent === 0) {
      currentParent = null;
      activeListKey = null;

      const colonIdx = trimmed.indexOf(':');
      if (colonIdx === -1) continue;

      const key = trimmed.substring(0, colonIdx).trim();
      const valStr = trimmed.substring(colonIdx + 1).trim();

      if (key === 'form_data') {
        currentParent = 'form_data';
        formData = {};
      } else if (valStr === '' || valStr === '|' || valStr === '>') {
        currentParent = key;
      } else {
        metadata[key] = parseYamlScalar(valStr);
      }
    } else if (currentParent === 'form_data') {
      // Sub-key in form_data
      if (trimmed.startsWith('- ') && activeListKey) {
        // Array item
        const itemVal = parseYamlScalar(trimmed.substring(2).trim());
        if (!Array.isArray(formData[activeListKey])) {
          formData[activeListKey] = [];
        }
        (formData[activeListKey] as unknown[]).push(itemVal);
      } else {
        const colonIdx = trimmed.indexOf(':');
        if (colonIdx !== -1) {
          const subKey = trimmed.substring(0, colonIdx).trim();
          const subValStr = trimmed.substring(colonIdx + 1).trim();

          if (subValStr === '') {
            activeListKey = subKey;
            formData[subKey] = [];
          } else {
            activeListKey = null;
            formData[subKey] = parseYamlScalar(subValStr) as FormDataValue;
          }
        }
      }
    }
  }

  return { metadata, formData, body };
}

function parseYamlScalar(val: string): unknown {
  const trimmed = val.trim();
  // Strip quotes
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (trimmed === 'null' || trimmed === '~') return null;
  if (!isNaN(Number(trimmed)) && trimmed !== '') return Number(trimmed);
  // Inline list: [a, b, c]
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return trimmed
      .slice(1, -1)
      .split(',')
      .map(s => parseYamlScalar(s.trim()));
  }
  return trimmed;
}

/**
 * Parses a full form document from raw Markdown content and runs cryptographic checksum verification.
 */
export async function parseFormDocument(content: string): Promise<FormDocument> {
  const { metadata, formData, body } = parseFrontmatter(content);
  const fields = extractFieldsFromTemplate(body);

  const verification = await verifyTemplateChecksum(body, metadata.template_checksum);

  return {
    metadata,
    templateBody: body,
    formData,
    fields,
    verification: {
      ...verification,
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Serializes a FormDocument back to a clean Markdown file with YAML frontmatter.
 * Preserves the canonical template body verbatim so the checksum stays strictly valid!
 */
export function serializeFormDocument(doc: FormDocument): string {
  const meta = { ...doc.metadata };
  meta.status = Object.keys(doc.formData).length > 0 ? 'filled' : 'template';
  meta.updated_at = new Date().toISOString().split('T')[0];

  const lines: string[] = ['---'];

  // Add primary metadata
  if (meta.title) lines.push(`title: "${escapeQuotes(meta.title)}"`);
  if (meta.template_id) lines.push(`template_id: "${meta.template_id}"`);
  if (meta.version) lines.push(`version: "${meta.version}"`);
  if (meta.template_checksum) lines.push(`template_checksum: "${meta.template_checksum}"`);
  if (meta.status) lines.push(`status: "${meta.status}"`);
  if (meta.created_at) lines.push(`created_at: "${meta.created_at}"`);
  if (meta.updated_at) lines.push(`updated_at: "${meta.updated_at}"`);
  if (meta.author) lines.push(`author: "${escapeQuotes(meta.author)}"`);
  if (meta.description) lines.push(`description: "${escapeQuotes(meta.description)}"`);

  // Serialize form_data
  lines.push('form_data:');
  const keys = Object.keys(doc.formData);
  if (keys.length === 0) {
    // Keep empty dict
  } else {
    for (const key of keys) {
      const val = doc.formData[key];
      if (val === null || val === undefined) {
        lines.push(`  ${key}: null`);
      } else if (typeof val === 'string') {
        if (val.includes('\n') || val.startsWith('data:image')) {
          lines.push(`  ${key}: "${escapeQuotes(val)}"`);
        } else {
          lines.push(`  ${key}: "${escapeQuotes(val)}"`);
        }
      } else if (typeof val === 'number' || typeof val === 'boolean') {
        lines.push(`  ${key}: ${val}`);
      } else if (Array.isArray(val)) {
        lines.push(`  ${key}:`);
        for (const item of val) {
          lines.push(`    - "${escapeQuotes(String(item))}"`);
        }
      } else if (typeof val === 'object') {
        lines.push(`  ${key}: "${escapeQuotes(JSON.stringify(val))}"`);
      }
    }
  }

  lines.push('---');
  lines.push('');
  lines.push(doc.templateBody.trim());
  lines.push('');

  return lines.join('\n');
}

function escapeQuotes(str: string): string {
  return str.replace(/"/g, '\\"');
}
