import type { GifCompositor } from '../../../modules/animation/types';
import { calculateCompositorFps } from './calculate-compositor-fps';

/**
 * Calculate which frame indices to keep for target FPS (compositor version)
 */
export function decimateCompositorFrames(compositor: GifCompositor, targetFps: number): number[] {
  if (compositor.frameCount <= 1 || targetFps <= 0) {
    return Array.from({ length: compositor.frameCount }, (_, i) => i);
  }

  const sourceFps = calculateCompositorFps(compositor);

  if (sourceFps <= targetFps) {
    return Array.from({ length: compositor.frameCount }, (_, i) => i);
  }

  const ratio = sourceFps / targetFps;
  const keepIndices: number[] = [];

  let accumulator = 0;
  for (let i = 0; i < compositor.frameCount; i++) {
    accumulator += 1;
    if (accumulator >= ratio) {
      keepIndices.push(i);
      accumulator -= ratio;
    }
  }

  const lastIdx = compositor.frameCount - 1;
  if (keepIndices.length > 0) {
    if (keepIndices[0] !== 0) {
      keepIndices.unshift(0);
    }
    if (keepIndices[keepIndices.length - 1] !== lastIdx) {
      keepIndices.push(lastIdx);
    }
  }

  return keepIndices;
}
