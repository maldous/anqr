/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Apply interpolation between animation frames.
 */

import { interpolateFrames } from "@/domain/render/animation";

export async function applyInterpolationToFrames(
  frames: (HTMLCanvasElement | OffscreenCanvas)[],
  interpolateMode: string,
): Promise<(HTMLCanvasElement | OffscreenCanvas)[]> {
  if (interpolateMode === "none" || frames.length <= 1) return frames;
  const interpolatedFrames: (HTMLCanvasElement | OffscreenCanvas)[] = [];
  const interpolationSteps = 2;
  for (let i = 0; i < frames.length - 1; i++) {
    interpolatedFrames.push(frames[i]);
    for (let step = 1; step <= interpolationSteps; step++) {
      const t = step / (interpolationSteps + 1);
      const interpolated = interpolateFrames(
        frames[i],
        frames[i + 1],
        t,
        interpolateMode as "none" | "crossfade" | "morph",
      );
      interpolatedFrames.push(interpolated);
    }
  }
  interpolatedFrames.push(frames[frames.length - 1]);
  return interpolatedFrames;
}
