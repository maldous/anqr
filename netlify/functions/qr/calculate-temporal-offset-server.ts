import { AnimationTemporalDitherMode } from "./animation-temporal-dither-mode.types";

export function calculateTemporalOffsetServer(
  frameIndex: number,
  mode: AnimationTemporalDitherMode,
  seed = 0,
): number {
  if (mode === "off") return 0;
  if (mode === "blue_noise") {
    const phi = 1.618033988749895;
    return (frameIndex * phi + seed * 0.1) % 1;
  }
  // flicker_safe
  const safeOffsets = [
    0, 0.5, 0.25, 0.75, 0.125, 0.625, 0.375, 0.875, 0.0625, 0.5625, 0.3125, 0.8125, 0.1875, 0.6875,
    0.4375, 0.9375,
  ];
  return (safeOffsets[frameIndex % safeOffsets.length] + seed * 0.01) % 1;
}
