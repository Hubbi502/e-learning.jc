import { createHash } from 'crypto';

/**
 * Hash fingerprint ID using SHA-256
 * This ensures privacy while still allowing duplicate detection
 * 
 * @param fingerprintId - The FingerprintJS visitor ID
 * @param salt - Optional salt for additional security (default: env variable or empty string)
 * @returns Hashed fingerprint as hex string
 */
export function hashFingerprint(fingerprintId: string, salt?: string): string {
  const saltValue = salt || process.env.FINGERPRINT_HASH_SALT || '';
  const hash = createHash('sha256');
  hash.update(fingerprintId + saltValue);
  return hash.digest('hex');
}

/**
 * Validate fingerprint format
 * FingerprintJS visitor IDs are typically alphanumeric strings
 */
export function isValidFingerprint(fingerprintId: string): boolean {
  // Check if it's a non-empty string with reasonable length
  if (!fingerprintId || typeof fingerprintId !== 'string') {
    return false;
  }
  
  // FingerprintJS visitor IDs are typically 20 characters
  // Allow range of 10-50 characters to be flexible
  if (fingerprintId.length < 10 || fingerprintId.length > 50) {
    return false;
  }
  
  // Check if it contains only alphanumeric characters
  const alphanumericRegex = /^[a-zA-Z0-9]+$/;
  return alphanumericRegex.test(fingerprintId);
}
