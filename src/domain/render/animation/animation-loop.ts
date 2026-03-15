/**
 * Animation Loop
 * Create and manage animation loop handlers
 */

import { createLogger } from '../../../infra/logging/logger';
import { advanceAnimation, createAnimationState } from '../../../modules/animation/state';
import type {
  AnimationFrame,
  AnimationOptions,
  AnimationState,
} from '../../../modules/animation/types';

const _log = createLogger('ANIMATION');

/**
 * Create an animation loop handler
 */
export function createAnimationLoop(
  onFrame: (frameIndex: number, canvas: HTMLCanvasElement | OffscreenCanvas) => void,
  options: AnimationOptions
): { start: () => void; stop: () => void; setFrames: (frames: AnimationFrame[]) => void } {
  let state: AnimationState | null = null;
  let animationId: number | null = null;

  const tick = () => {
    if (!state?.playing) return;

    const now = performance.now();
    const frameDelay = state.frames[state.currentFrame]?.delay || options.speedMs;

    if (now - state.lastFrameTime >= frameDelay) {
      onFrame(state.currentFrame, state.frames[state.currentFrame].canvas);
      state = advanceAnimation(state, options);
    }

    animationId = requestAnimationFrame(tick);
  };

  return {
    start: () => {
      if (state) {
        state.playing = true;
        state.lastFrameTime = performance.now();
        tick();
      }
    },
    stop: () => {
      if (state) {
        state.playing = false;
      }
      if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    },
    setFrames: (frames: AnimationFrame[]) => {
      state = createAnimationState(frames);
    },
  };
}
