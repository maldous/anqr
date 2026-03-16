/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Pattern effect type for animation.
 */

import type { AnimationPattern } from "@/modules/animation";

export type PatternEffect = {
  pattern: AnimationPattern;
  seed: number;
  waveAxis: "x" | "y" | "xy";
};
