/**
 * Canonicalizes template text for deterministic hashing.
 * Normalizes line endings to LF (\n), trims trailing whitespace from lines,
 * and strips leading/trailing document whitespace.
 */
export function canonicalizeTemplate(text: string): string {
  if (!text) return '';
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n')
    .trim();
}

/**
 * Computes a SHA-256 hash formatted as 'sha256:abcdef...'
 * Works in modern browsers, Bun, and Node.js.
 */
export async function computeSha256(content: string): Promise<string> {
  const normalized = canonicalizeTemplate(content);
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);

  // Check Web Crypto API
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return `sha256:${hashHex}`;
  }

  // Fallback for Node/Bun environment if subtle is somehow not present
  try {
    const nodeCrypto = await (Function('return import("crypto")')()) as {
      createHash: (alg: string) => { update: (data: Uint8Array) => { digest: (enc: string) => string } };
    };
    const hashHex = nodeCrypto.createHash('sha256').update(data).digest('hex');
    return `sha256:${hashHex}`;
  } catch {
    throw new Error('Cryptographic SHA-256 calculation is not supported in this environment');
  }
}

/**
 * Verifies if the current template matches the sealed checksum.
 */
export async function verifyTemplateChecksum(
  templateBody: string,
  expectedChecksum?: string
): Promise<{
  status: 'verified' | 'tampered' | 'unsealed';
  isValid: boolean;
  computedHash: string;
  expectedHash?: string;
  message: string;
}> {
  const computedHash = await computeSha256(templateBody);

  if (!expectedChecksum || expectedChecksum.trim() === '') {
    return {
      status: 'unsealed',
      isValid: false,
      computedHash,
      message: 'Document is not sealed. Template structure can be modified.',
    };
  }

  const normalizedExpected = expectedChecksum.trim().toLowerCase();
  const normalizedComputed = computedHash.toLowerCase();

  if (normalizedExpected === normalizedComputed) {
    return {
      status: 'verified',
      isValid: true,
      computedHash,
      expectedHash: expectedChecksum,
      message: 'Template integrity verified. The layout and content are authentic and untampered.',
    };
  }

  return {
    status: 'tampered',
    isValid: false,
    computedHash,
    expectedHash: expectedChecksum,
    message: 'SECURITY ALERT: Template text has been modified outside MViewer! Checksum mismatch detected.',
  };
}
