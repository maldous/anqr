import {col, for, i, j, maskPattern, row} from '../shared';
// ============================================
// FINDER PATTERN DETECTION
// ============================================

/**
 * Get mask function for a given mask pattern
 */
export function getMaskFunction(maskPattern: number): (row: number, col: number) => boolean {
  switch (maskPattern) {
    case 0: return (i, j) => (i + j) % 2 === 0;
    case 1: return (i, _j) => i % 2 === 0;
    case 2: return (_i, j) => j % 3 === 0;
    case 3: return (i, j) => (i + j) % 3 === 0;
    case 4: return (i, j) => (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0;
    case 5: return (i, j) => ((i * j) % 2) + ((i * j) % 3) === 0;
    case 6: return (i, j) => (((i * j) % 2) + ((i * j) % 3)) % 2 === 0;
    case 7: return (i, j) => (((i * j) % 3) + ((i + j) % 2)) % 2 === 0;
    default: return () => false;
  }
}

