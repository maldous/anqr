/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Apply pattern effect stack to canvas.
 */

import { applyAnimationPattern } from "@/domain/render/animation/apply-animation-pattern";
import { cloneCanvasSimple } from "@/features/generator/application/frames/clone-canvas-simple.service";
import type { PatternEffect } from "@/features/generator/application/frames/frames-patterneffect.types";

export function applyPatternStackToCanvas(
  sourceCanvas: HTMLCanvasElement | OffscreenCanvas,
  effects: PatternEffect[],
  frameIndex: number,
  totalFrames: number,
  persistentOutput: boolean,
  getPatternScratch: (slot: 0 | 1, width: number, height: number) => HTMLCanvasElement,
): HTMLCanvasElement | OffscreenCanvas {
  if (effects.length === 0) return sourceCanvas;
  let out = sourceCanvas;
  for (let effectIdx = 0; effectIdx < effects.length; effectIdx++) {
    const effect = effects[effectIdx];
    const targetCanvas = getPatternScratch((effectIdx % 2) as 0 | 1, out.width, out.height);
    out = applyAnimationPattern(
      out,
      frameIndex,
      totalFrames,
      effect.pattern,
      {
        seed: effect.seed,
        waveAxis: effect.waveAxis,
      },
      targetCanvas,
    );
  }
  return persistentOutput ? cloneCanvasSimple(out) : out;
}
