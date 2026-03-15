import { LENGTH_BITS } from './length-bits';

/**
 * Get character count indicator length in bits
 */
export function getLengthInBits(mode: number, type: number): number {
  if (type < 1 || type >= 41) throw new Error(`type:${type}`);
  const entry = LENGTH_BITS[mode];
  if (!entry) throw new Error(`mode:${mode}`);
  const versionRange = type < 10 ? 0 : type < 27 ? 1 : 2;
  return entry[versionRange];
}
