import { type Canvas } from "@napi-rs/canvas";
import type { AnimationEffectConfig } from "./animation-effect-config.types";
import { hasAnimationEffect } from "./has-animation-effect";
import { applyPatternToFrameServer } from "./apply-pattern-to-frame-server";

export function applyAnimationEffectsToCanvasServer(
  sourceCanvas: Canvas,
  effects: AnimationEffectConfig[],
  frameIndex: number,
  totalFrames: number,
): Canvas {
  if (!effects.length) {
    return sourceCanvas;
  }

  let frame = sourceCanvas;
  for (const effect of effects) {
    if (!hasAnimationEffect(effect)) {
      continue;
    }
    frame = applyPatternToFrameServer(
      frame,
      effect.pattern,
      frameIndex,
      totalFrames,
      effect.seed,
      effect.easing,
      effect.colorCycle,
      effect.reverse,
      effect.bounce,
      effect.waveAxis,
    );
  }
  return frame;
}
