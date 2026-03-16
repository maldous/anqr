import { type Canvas, createCanvas } from "@napi-rs/canvas";
import { type AnimationEasing, type AnimationPattern } from "../../../src/modules/animation";
import { AnimationWaveAxis } from "./animation-wave-axis.types";
import { computeAnimationProgress } from "./compute-animation-progress";
import { applyAnimationEffectToImageDataServer } from "./apply-animation-effect-to-image-data-server";

export function generatePatternFramesServer(
  sourceCanvas: Canvas,
  pattern: AnimationPattern,
  frameCount: number = 24,
  seed: number = 0,
  easing: AnimationEasing = "linear",
  waveAxis: AnimationWaveAxis = "y",
  colorCycle = false,
  reverse = false,
  bounce = false,
): Canvas[] {
  if (pattern === "none" && !colorCycle) {
    return [sourceCanvas];
  }

  const frames: Canvas[] = [];
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;

  const sourceCtx = sourceCanvas.getContext("2d");
  const sourceData = sourceCtx.getImageData(0, 0, width, height);

  for (let i = 0; i < frameCount; i++) {
    const progress = computeAnimationProgress(i, frameCount, easing, reverse, bounce);
    const frame = createCanvas(width, height);
    const ctx = frame.getContext("2d");

    const frameData = ctx.createImageData(width, height);
    frameData.data.set(sourceData.data);

    applyAnimationEffectToImageDataServer(frameData.data, width, height, progress, {
      pattern,
      seed,
      easing,
      colorCycle,
      reverse,
      bounce,
      target: "result",
      waveAxis,
    });

    ctx.putImageData(frameData, 0, 0);
    frames.push(frame);
  }

  return frames;
}
