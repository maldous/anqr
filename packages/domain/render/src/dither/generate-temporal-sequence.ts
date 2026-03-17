import type { TemporalDitherMode } from "./temporal.types";
import { calculateTemporalOffset } from "./calculate-temporal-offset";

/**
 * Generate a sequence of temporal offsets for a given number of frames
 * Useful for pre-calculating offsets for an entire animation
 */
export function generateTemporalSequence(
  frameCount: number,
  mode: TemporalDitherMode,
  seed: number = 0,
): number[] {
  const offsets: number[] = [];
  for (let i = 0; i < frameCount; i++) {
    offsets.push(calculateTemporalOffset(i, mode, seed));
  }
  return offsets;
}
