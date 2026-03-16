import { type Canvas } from "@napi-rs/canvas";
import { AnimationEffectConfig } from "./animation-effect-config.types";
import { AnimationTemporalDitherMode } from "./animation-temporal-dither-mode.types";
import { applyAnimationEffectsToCanvasServer } from "./apply-animation-effects-to-canvas-server";
import { calculateTemporalOffsetServer } from "./calculate-temporal-offset-server";
import { applyTemporalNoiseToCanvasServer } from "./apply-temporal-noise-to-canvas-server";

export function applyResultEffectsForFrameHelper(
  sourceCanvas: Canvas,
  frameIndex: number,
  totalFrames: number,
  resultAnimationEffects: AnimationEffectConfig[],
  temporalDither: AnimationTemporalDitherMode,
  animSeed: number,
  isArtwork: boolean,
): Canvas {
  let frame = applyAnimationEffectsToCanvasServer(
    sourceCanvas,
    resultAnimationEffects,
    frameIndex,
    totalFrames,
  );
  if (temporalDither !== "off") {
    const temporalOffset = calculateTemporalOffsetServer(frameIndex, temporalDither, animSeed);
    const temporalStrength = isArtwork ? 0.004 : 0.012;
    frame = applyTemporalNoiseToCanvasServer(frame, temporalOffset, temporalStrength);
  }
  return frame;
}
