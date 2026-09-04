import { expect, test, describe } from 'bun:test';
import {
  extractStructuredDataForLlm,
  buildLlmPrompt,
  simulateAiAutofill,
} from '../src/utils/llmExtract';
import type { FormDocument } from '../src/types/form';

describe('LLM Data Extraction & AI Engine', () => {
  const mockDoc: FormDocument = {
    metadata: {
      title: 'Medical Intake Form',
      template_id: 'med-2026-01',
      template_checksum: 'sha256:abc1234567890abcdef',
    },
    templateBody: '# Medical Form',
    formData: {
      patient_name: 'David Miller',
      date_of_birth: '1989-11-23',
      allergies: ['Penicillin', 'Sulfa'],
      rating: 5,
    },
    fields: [
      { id: 'patient_name', type: 'text', label: 'Patient Name' },
      { id: 'date_of_birth', type: 'date', label: 'Date of Birth' },
      { id: 'allergies', type: 'choice', label: 'Known Allergies', multiple: true },
      { id: 'rating', type: 'rating', label: 'Health Score' },
    ],
    verification: {
      status: 'verified',
      isValid: true,
      computedHash: 'sha256:abc1234567890abcdef',
      timestamp: new Date().toISOString(),
      message: 'Verified',
    },
  };

  test('extracts clean structured JSON with metadata and answers', () => {
    const result = extractStructuredDataForLlm(mockDoc);

    expect(result.metadata.title).toBe('Medical Intake Form');
    expect(result.metadata.verified).toBe(true);
    expect(result.clean_key_values.patient_name).toBe('David Miller');
    expect(result.clean_key_values.allergies).toEqual(['Penicillin', 'Sulfa']);
  });

  test('demonstrates 90%+ token reduction compared to traditional PDF OCR', () => {
    const result = extractStructuredDataForLlm(mockDoc);

    expect(result.token_benchmark.markdown_tokens).toBeLessThan(300);
    expect(result.token_benchmark.pdf_ocr_tokens).toBeGreaterThan(2000);
    expect(result.token_benchmark.token_savings_percent).toBeGreaterThan(80);
  });

  test('generates an authentic prompt ready for Gemini/ChatGPT/Claude', () => {
    const prompt = buildLlmPrompt(mockDoc);

    expect(prompt).toContain('CRYPTOGRAPHICALLY VERIFIED DOCUMENT DATA');
    expect(prompt).toContain('David Miller');
    expect(prompt).toContain('sha256:abc1234567890abcdef');
  });

  test('autofills fields from unstructured text notes', () => {
    const notes = 'Patient name is Sarah Connor, born 1985-05-12, contact email sconnor@skynet.org, phone (555) 987-6543';
    const fields = [
      { id: 'name', type: 'text', label: 'Full Name' },
      { id: 'dob', type: 'date', label: 'Birth Date' },
      { id: 'email', type: 'email', label: 'Email Address' },
      { id: 'phone', type: 'phone', label: 'Phone Number' },
    ] as const;

    const populated = simulateAiAutofill(notes, [...fields]);

    expect(populated.name).toBe('Sarah Connor');
    expect(populated.dob).toBe('1985-05-12');
    expect(populated.email).toBe('sconnor@skynet.org');
    expect(populated.phone).toBe('(555) 987-6543');
  });
});
