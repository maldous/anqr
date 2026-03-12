import type { AnimationFrame } from '../../../modules/animation/types';

/**
 * Calculate effective FPS from frame delays
 */
export function calculateSourceFps(frames: AnimationFrame[]): number {
  if (frames.length === 0) return 10;
  const totalDelay = frames.reduce((sum, f) => sum + (f.delay || 100), 0);
  const avgDelay = totalDelay / frames.length;
  return 1000 / avgDelay;
}
