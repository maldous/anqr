import type { AnimationFrame } from '../../../modules/animation/types';
import { calculateSourceFps } from './calculate-source-fps';

/**
 * Decimate frames to target FPS by skipping frames
 * @deprecated Use decimateCompositorFrames with GifCompositor instead
 */
export function decimateFramesToFps(frames: AnimationFrame[], targetFps: number): number[] {
  if (frames.length <= 1 || targetFps <= 0) {
    return frames.map((_, i) => i);
  }

  const sourceFps = calculateSourceFps(frames);

  if (sourceFps <= targetFps) {
    return frames.map((_, i) => i);
  }

  const ratio = sourceFps / targetFps;
  const keepIndices: number[] = [];

  let accumulator = 0;
  for (let i = 0; i < frames.length; i++) {
    accumulator += 1;
    if (accumulator >= ratio) {
      keepIndices.push(i);
      accumulator -= ratio;
    }
  }

  if (keepIndices.length > 0 && keepIndices[0] !== 0) {
    keepIndices.unshift(0);
  }
  if (keepIndices.length > 0 && keepIndices[keepIndices.length - 1] !== frames.length - 1) {
    keepIndices.push(frames.length - 1);
  }

  return keepIndices;
}
