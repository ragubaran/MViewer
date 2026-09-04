import { expect, test, describe } from 'bun:test';
import { canonicalizeTemplate, computeSha256, verifyTemplateChecksum } from '../src/utils/crypto';

describe('Cryptographic Template Hashing & Integrity', () => {
  const sampleTemplate = `# Patient Intake Form\n\nPlease fill out your details:\n- Name: {{input:name}}\n- Date: {{date:visit_date}}`;

  test('generates deterministic SHA-256 hash', async () => {
    const hash1 = await computeSha256(sampleTemplate);
    const hash2 = await computeSha256(sampleTemplate);

    expect(hash1).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(hash1).toBe(hash2);
  });

  test('normalizes CRLF and LF line endings without altering hash', async () => {
    const crlfTemplate = sampleTemplate.replace(/\n/g, '\r\n');
    const hashLf = await computeSha256(sampleTemplate);
    const hashCrlf = await computeSha256(crlfTemplate);

    expect(hashLf).toBe(hashCrlf);
  });

  test('verifies genuine unmodified template successfully', async () => {
    const sealedHash = await computeSha256(sampleTemplate);
    const result = await verifyTemplateChecksum(sampleTemplate, sealedHash);

    expect(result.isValid).toBe(true);
    expect(result.status).toBe('verified');
  });

  test('detects unauthorized template modifications (tamper detection)', async () => {
    const sealedHash = await computeSha256(sampleTemplate);
    // Someone modifies one character in external editor (e.g. changes "details" to "records")
    const tamperedTemplate = sampleTemplate.replace('details', 'records');

    const result = await verifyTemplateChecksum(tamperedTemplate, sealedHash);

    expect(result.isValid).toBe(false);
    expect(result.status).toBe('tampered');
    expect(result.message).toContain('SECURITY ALERT');
  });

  test('identifies unsealed draft templates', async () => {
    const result = await verifyTemplateChecksum(sampleTemplate, undefined);
    expect(result.isValid).toBe(false);
    expect(result.status).toBe('unsealed');
  });
});
