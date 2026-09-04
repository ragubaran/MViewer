import { expect, test, describe } from 'bun:test';
import {
  parseAttributes,
  parseFieldDirective,
  extractFieldsFromTemplate,
  parseFrontmatter,
  parseFormDocument,
  serializeFormDocument,
} from '../src/utils/parser';
import { computeSha256 } from '../src/utils/crypto';

describe('Markdown & Form Token Parser', () => {
  test('parses attributes correctly with various types', () => {
    const attrStr = 'label="Full Name" required=true rows=5 options="A, B, C"';
    const parsed = parseAttributes(attrStr);

    expect(parsed.label).toBe('Full Name');
    expect(parsed.required).toBe(true);
    expect(parsed.rows).toBe(5);
    expect(Array.isArray(parsed.options)).toBe(true);
    expect(parsed.options).toEqual(['A', 'B', 'C']);
  });

  test('parses Typeform-style field directives', () => {
    // 1. Text input
    const textF = parseFieldDirective('{{input:email type="email" label="Work Email" required=true}}');
    expect(textF).not.toBeNull();
    expect(textF?.id).toBe('email');
    expect(textF?.type).toBe('email');
    expect(textF?.required).toBe(true);

    // 2. Choice with options
    const choiceF = parseFieldDirective('{{choice:skills options="React, Rust, Python" multiple=true style="chips"}}');
    expect(choiceF?.id).toBe('skills');
    expect(choiceF?.type).toBe('choice');
    expect(choiceF?.multiple).toBe(true);
    expect(choiceF?.options).toEqual(['React', 'Rust', 'Python']);

    // 3. Rating & Scales
    const ratingF = parseFieldDirective('{{rating:feedback max=5 icon="star"}}');
    expect(ratingF?.type).toBe('rating');
    expect(ratingF?.max).toBe(5);

    const scaleF = parseFieldDirective('{{scale:nps min=0 max=10 lowLabel="Poor" highLabel="Excellent"}}');
    expect(scaleF?.type).toBe('scale');
    expect(scaleF?.lowLabel).toBe('Poor');

    // 4. Digital Signature
    const sigF = parseFieldDirective('{{signature:patient_sig label="Authorized Signature" required=true}}');
    expect(sigF?.type).toBe('signature');
    expect(sigF?.required).toBe(true);
  });

  test('extracts all embedded fields from a template document', () => {
    const md = `
# Employee Onboarding
Welcome! Please submit:
- **Full Name**: {{input:name label="Full Name" required=true}}
- **Department**: {{select:dept options="Engineering, Product, Design"}}
- **Signature**: {{signature:sig required=true}}
    `;

    const fields = extractFieldsFromTemplate(md);
    expect(fields.length).toBe(3);
    expect(fields.map(f => f.id)).toEqual(['name', 'dept', 'sig']);
  });

  test('preserves template checksum after filling form fields', async () => {
    const templateBody = `# Job Application\n\n- Name: {{input:name}}\n- Role: {{input:role}}`;
    const checksum = await computeSha256(templateBody);

    const rawDoc = `---
title: "Job Application"
template_checksum: "${checksum}"
form_data:
  name: "Alice Smith"
  role: "Senior Engineer"
---

${templateBody}`;

    const parsed = await parseFormDocument(rawDoc);
    expect(parsed.verification.isValid).toBe(true);
    expect(parsed.verification.status).toBe('verified');
    expect(parsed.formData.name).toBe('Alice Smith');

    // Now serialize and re-parse to ensure the template checksum never breaks when saving answers
    const serialized = serializeFormDocument(parsed);
    const reloaded = await parseFormDocument(serialized);
    expect(reloaded.verification.isValid).toBe(true);
    expect(reloaded.formData.name).toBe('Alice Smith');
    expect(reloaded.formData.role).toBe('Senior Engineer');
  });
});
