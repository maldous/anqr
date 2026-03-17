import type { TemporalDitherMode } from "./temporal.types";

/**
 * Calculate the temporal dither offset for a given frame
 * This offset is used to shift the dither pattern, creating temporal variation
 */
export function calculateTemporalOffset(
  frameIndex: number,
  mode: TemporalDitherMode,
  seed: number = 0,
): number {
  if (mode === "off" || !mode) {
    return 0;
  }

  if (mode === "blue_noise") {
    // Blue noise temporal dithering: use golden ratio offset for each frame
    // This creates a maximally spread (low-discrepancy) sequence
    // that fills the [0,1] space evenly over time
    const phi = 1.618033988749895; // Golden ratio
    return (frameIndex * phi + seed * 0.1) % 1;
  }

  if (mode === "flicker_safe") {
    // Flicker-safe: use slower, more gradual changes
    // Uses a carefully ordered set of offsets that:
    // 1. Don't create jarring transitions between adjacent frames
    // 2. Still provide good temporal coverage over time
    // 3. Return to similar values periodically for loop stability
    const safeOffsets = [
      0, // Frame 0
      0.5, // Frame 1 - halfway
      0.25, // Frame 2 - quarter
      0.75, // Frame 3 - three-quarter
      0.125, // Frame 4 - eighth
      0.625, // Frame 5
      0.375, // Frame 6
      0.875, // Frame 7
      0.0625, // Frame 8 - sixteenth
      0.5625, // Frame 9
      0.3125, // Frame 10
      0.8125, // Frame 11
      0.1875, // Frame 12
      0.6875, // Frame 13
      0.4375, // Frame 14
      0.9375, // Frame 15
    ];
    const offset = safeOffsets[frameIndex % safeOffsets.length];
    return (offset + seed * 0.01) % 1;
  }

  return 0;
}
