import type { AnimationPattern } from './animation-patterns.types';
import { buildPatternFrameApplier } from './build-pattern-frame-applier';

export function applyPatternToImageData(
  imageData: ImageData,
  pattern: AnimationPattern,
  progress: number,
  speed: number,
  seed: number
): void {
  const { data, width, height } = imageData;
  const applyForFrame = buildPatternFrameApplier(pattern, progress, speed, seed, width, height);
  applyForFrame(data);
}
