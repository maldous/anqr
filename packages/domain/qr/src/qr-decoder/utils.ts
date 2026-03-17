/**
 * QR Decoder Utilities
 * Shared helper functions for QR decoding
 */

import { createLogger } from "@/infra/logging/logger";

const _log = createLogger("DECODER");

import type { Point } from "./types";

/**
 * Calculate Euclidean distance between two points
 */
export function pointDistance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
