/**
 * Animation Types
 */

import { createLogger } from '../../lib/logger';

const _log = createLogger('ANIMATION');

export interface AnimationFrame {
  canvas: HTMLCanvasElement | OffscreenCanvas;
  delay: number; // milliseconds
  disposalType: number;
}

export interface AnimationOptions {
  speedMs: number;
  loop: boolean;
  bounce: boolean;
  startFrame: number;
  maxFrames: number;
  frameStep: number;
  interpolate: 'none' | 'crossfade' | 'morph';
  pattern: AnimationPattern;
  moduleJitterPx: number;
  colorCycle: boolean;
  temporalDither: 'off' | 'blue_noise' | 'flicker_safe';
  seed: number;
}

export type AnimationPattern = 'none' | 'pulse' | 'wave' | 'scanline' | 'shimmer' | 'drift';

export interface AnimationState {
  frames: AnimationFrame[];
  currentFrame: number;
  playing: boolean;
  direction: 1 | -1;
  lastFrameTime: number;
}

export interface GifCompositor {
  /** The single reusable canvas - always reflects the current composed frame */
  canvas: HTMLCanvasElement | OffscreenCanvas;
  /** Total number of frames */
  frameCount: number;
  /** Width of the GIF */
  width: number;
  /** Height of the GIF */
  height: number;
  /** Get delay for frame i in milliseconds */
  delayMs: (i: number) => number;
  /** Apply frame i's patch to the canvas */
  apply: (i: number) => void;
  /** Handle disposal after frame i (call before applying next frame) */
  dispose: (i: number) => void;
  /** Reset compositor to initial state */
  reset: () => void;
}
