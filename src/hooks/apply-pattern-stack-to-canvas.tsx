import { applyAnimationPattern } from '../domain/render/animation';
import { cloneCanvasSimple } from './clone-canvas-simple';
import type { PatternEffect } from './pattern-effect';

export function applyPatternStackToCanvas(
  sourceCanvas: HTMLCanvasElement | OffscreenCanvas,
  effects: PatternEffect[],
  frameIndex: number,
  totalFrames: number,
  persistentOutput: boolean,
  getPatternScratch: (slot: 0 | 1, width: number, height: number) => HTMLCanvasElement
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
      effect.pattern as any,
      {
        seed: effect.seed,
        waveAxis: effect.waveAxis,
      },
      targetCanvas
    );
  }
  return persistentOutput ? cloneCanvasSimple(out) : out;
}
