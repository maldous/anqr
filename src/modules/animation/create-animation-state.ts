import type { AnimationFrame, AnimationState } from './types';

/**
 * Create initial animation state
 */
export function createAnimationState(frames: AnimationFrame[]): AnimationState {
  return {
    frames,
    currentFrame: 0,
    playing: true,
    direction: 1,
    lastFrameTime: 0,
  };
}
