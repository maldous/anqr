import { mulberry32 } from './mulberry32';

/**
 * Generate a deterministic numeric suffix (digits only).
 * Useful for mixed-mode QR (byte prefix + numeric suffix).
 *
 * @param length Number of digits
 * @param seed Seed value
 * @returns Deterministic numeric string
 */
export function generateDeterministicNumericSuffix(length: number, seed: number): string {
  const random = mulberry32(seed);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += Math.floor(random() * 10).toString();
  }
  return result;
}
