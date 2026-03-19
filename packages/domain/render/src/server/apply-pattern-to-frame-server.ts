import { type Canvas, createCanvas } from "@napi-rs/canvas";
import { type AnimationEasing, type AnimationPattern } from "@/modules/animation";
import type { AnimationWaveAxis } from "./animation-wave-axis.types";
import { computeAnimationProgress } from "./compute-animation-progress";
import { applyAnimationEffectToImageDataServer } from "./apply-animation-effect-to-image-data-server";

export function applyPatternToFrameServer(
  sourceCanvas: Canvas,
  pattern: AnimationPattern,
  frameIndex: number,
  totalFrames: number,
  seed: number,
  easing: AnimationEasing,
  colorCycle: boolean,
  reverse = false,
  bounce = false,
  waveAxis: AnimationWaveAxis = "y",
): Canvas {
  if (pattern === "none" && !colorCycle) {
    return sourceCanvas;
  }

  const width = sourceCanvas.width;
  const height = sourceCanvas.height;
  const frame = createCanvas(width, height);
  const ctx = frame.getContext("2d");
  ctx.drawImage(sourceCanvas, 0, 0);

  const frameData = ctx.getImageData(0, 0, width, height);
  const progress = computeAnimationProgress(frameIndex, totalFrames, easing, reverse, bounce);
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
  return frame;
}
