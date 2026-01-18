/**
 * QR Decoder Utilities
 * Shared helper functions for QR decoding
 */

import type { Point } from './types';

/**
 * Calculate Euclidean distance between two points
 */
export function pointDistance(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}
