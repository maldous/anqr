/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Build pattern effect lists from animation state.
 */

import type { AnimationPattern } from "@/modules/animation";
import type { PatternEffect } from "@/features/generator/application/frames/frames-patterneffect.types";

export function buildPatternEffectLists(animationState: {
  pattern: string;
  pattern2: string;
  seed: number;
  waveAxis: "x" | "y" | "xy";
  waveAxis2: "x" | "y" | "xy";
  target: string;
  target2: string;
}): { modulePatternEffects: PatternEffect[]; resultPatternEffects: PatternEffect[] } {
  const modulePatternEffects: PatternEffect[] = [];
  const resultPatternEffects: PatternEffect[] = [];
  if (animationState.pattern !== "none") {
    const primaryEffect: PatternEffect = {
      pattern: animationState.pattern as AnimationPattern,
      seed: animationState.seed,
      waveAxis: animationState.waveAxis,
    };
    if (animationState.target === "modules" || animationState.target === "both") {
      modulePatternEffects.push(primaryEffect);
    }
    if (animationState.target === "result" || animationState.target === "both") {
      resultPatternEffects.push(primaryEffect);
    }
  }
  if (animationState.pattern2 !== "none") {
    const secondaryEffect: PatternEffect = {
      pattern: animationState.pattern2 as AnimationPattern,
      seed: animationState.seed + 911,
      waveAxis: animationState.waveAxis2,
    };
    if (animationState.target2 === "modules" || animationState.target2 === "both") {
      modulePatternEffects.push(secondaryEffect);
    }
    if (animationState.target2 === "result" || animationState.target2 === "both") {
      resultPatternEffects.push(secondaryEffect);
    }
  }
  return { modulePatternEffects, resultPatternEffects };
}
