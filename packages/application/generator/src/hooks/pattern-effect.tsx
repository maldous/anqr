import type { AnimationPattern } from "@/domain/render/animation";

export type PatternEffect = {
  pattern: AnimationPattern;
  seed: number;
  waveAxis: "x" | "y" | "xy";
};
