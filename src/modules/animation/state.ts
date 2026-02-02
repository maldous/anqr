/**
 * Animation State Management
 */

import { createLogger } from '../../lib/logger';

const _log = createLogger('ANIMATION');

import type { AnimationFrame, AnimationOptions, AnimationState } from './types';

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

/**
 * Get the next frame index based on animation options
 */
export function getNextFrame(
  state: AnimationState,
  options: AnimationOptions
): { frameIndex: number; direction: 1 | -1 } {
  const { frames, currentFrame, direction } = state;
  const { loop, bounce, frameStep } = options;

  let nextFrame = currentFrame + direction * frameStep;
  let nextDirection = direction;

  if (nextFrame >= frames.length) {
    if (bounce) {
      nextDirection = -1;
      nextFrame = frames.length - 2;
    } else if (loop) {
      nextFrame = 0;
    } else {
      nextFrame = frames.length - 1;
    }
  } else if (nextFrame < 0) {
    if (bounce) {
      nextDirection = 1;
      nextFrame = 1;
    } else if (loop) {
      nextFrame = frames.length - 1;
    } else {
      nextFrame = 0;
    }
  }

  return {
    frameIndex: Math.max(0, Math.min(frames.length - 1, nextFrame)),
    direction: nextDirection,
  };
}

/**
 * Update animation state for the next frame
 */
export function advanceAnimation(state: AnimationState, options: AnimationOptions): AnimationState {
  const { frameIndex, direction } = getNextFrame(state, options);

  return {
    ...state,
    currentFrame: frameIndex,
    direction,
    lastFrameTime: performance.now(),
  };
}
