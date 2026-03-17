import type { AnimationPattern } from "./animation-patterns.types";
import { applyPatternToImageData } from "./apply-pattern-to-image-data";

// ============================================
// MAIN EXPORTS
// ============================================

/**
 * Generate animation pattern frames from a static image
 * Creates multiple frames with pattern effects applied
 */
export function generateAnimationPatternFrames(
  sourceCanvas: HTMLCanvasElement | OffscreenCanvas,
  pattern: AnimationPattern,
  frameCount: number,
  speed: number = 1,
  seed: number = 0,
): HTMLCanvasElement[] {
  if (pattern === "none" || frameCount <= 1) {
    // Return single frame copy
    const canvas = document.createElement("canvas");
    canvas.width = sourceCanvas.width;
    canvas.height = sourceCanvas.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(sourceCanvas, 0, 0);
    return [canvas];
  }

  const frames: HTMLCanvasElement[] = [];
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;

  // Get source image data
  const sourceCtx =
    (sourceCanvas.getContext("2d", {
      willReadFrequently: true,
      desynchronized: true,
    } as CanvasRenderingContext2DSettings | undefined) as CanvasRenderingContext2D | null) ??
    sourceCanvas.getContext("2d");
  if (!sourceCtx) {
    throw new Error("Could not get 2D context from source canvas");
  }
  const sourceData = sourceCtx.getImageData(0, 0, width, height);
  const sourcePixels = sourceData.data;
  const framePixels = new Uint8ClampedArray(sourcePixels.length);
  const reusableFrameData = new ImageData(framePixels, width, height);

  for (let f = 0; f < frameCount; f++) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;

    // Copy source data into a reusable frame buffer.
    framePixels.set(sourcePixels);

    // Apply pattern effect based on frame number
    const progress = f / frameCount;
    applyPatternToImageData(reusableFrameData, pattern, progress, speed, seed);

    ctx.putImageData(reusableFrameData, 0, 0);
    frames.push(canvas);
  }

  return frames;
}
