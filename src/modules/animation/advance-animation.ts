import type { AnimationOptions, AnimationState } from "./types";
import { getNextFrame } from "./get-next-frame";

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
