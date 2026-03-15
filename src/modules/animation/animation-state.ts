import type { AnimationFrame } from './animation-frame';

export interface AnimationState {
  frames: AnimationFrame[];
  currentFrame: number;
  playing: boolean;
  direction: 1 | -1;
  lastFrameTime: number;
}
