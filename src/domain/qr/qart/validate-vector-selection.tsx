import { log } from './log';

/**
 * Validate that selected vectors only affect allowed bits
 *
 * @param selectedVectorBits Array of { blockIndex, affectedLocalBits } for each selected vector
 * @param blockAllowedBits Per-block allowed bit sets
 * @returns Validation result with any violations
 */
export function validateVectorSelection(
  selectedVectorBits: Array<{ blockIndex: number; affectedLocalBits: number[] }>,
  blockAllowedBits: Map<number, Set<number>>
): { valid: boolean; violations: Array<{ blockIndex: number; bit: number }> } {
  const violations: Array<{ blockIndex: number; bit: number }> = [];

  for (const vector of selectedVectorBits) {
    const allowedSet = blockAllowedBits.get(vector.blockIndex);
    if (!allowedSet) {
      // Entire block is protected
      for (const bit of vector.affectedLocalBits) {
        violations.push({ blockIndex: vector.blockIndex, bit });
      }
      continue;
    }

    for (const bit of vector.affectedLocalBits) {
      if (!allowedSet.has(bit)) {
        violations.push({ blockIndex: vector.blockIndex, bit });
      }
    }
  }

  if (violations.length > 0) {
    log.warn('Vector selection violates protected bits!', {
      violationCount: violations.length,
      sampleViolations: violations.slice(0, 10),
    });
  }

  return { valid: violations.length === 0, violations };
}
