import { hashStringToSeed } from './hash-string-to-seed';
import { mulberry32 } from './mulberry32';

/**
 * Generate a deterministic URL-safe suffix.
 * Given the same input data and version, ALWAYS produces the same suffix.
 * This ensures the baseline QR is stable across runs, making QR-Art more predictable.
 * Uses alphanumeric characters (A-Za-z0-9) which are URL-safe and byte-mode compatible.
 * Byte mode is essential for QART: any bit flip produces a valid decoded byte.
 *
 * @param length Number of characters
 * @param seed Seed value (typically from hashStringToSeed)
 * @returns Deterministic alphanumeric string
 */
export function generateDeterministicSuffix(length: number, seed: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const random = mulberry32(seed);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(random() * chars.length)];
  }
  return result;
}
