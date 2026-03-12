/**
 * Animation Types
 */

import { createLogger } from '../../infra/logging/logger';

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
  target: 'result' | 'modules' | 'both';
  waveAxis: 'x' | 'y' | 'xy';
  pattern2?: AnimationPattern;
  target2?: 'result' | 'modules' | 'both';
  waveAxis2?: 'x' | 'y' | 'xy';
  effectBounds?: { x: number; y: number; width: number; height: number };
}

export type AnimationPattern = 'none' | 'pulse' | 'wave' | 'scanline' | 'shimmer' | 'drift'
  | 'color_cycle';

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
  /** Get source disposal type for frame i (0=unspecified, 1=keep, 2=restore_bg, 3=restore_previous) */
  disposalType: (i: number) => number;
  /** Get patch dimensions for frame i */
  frameDims: (i: number) => { left: number; top: number; width: number; height: number };
  /** Apply frame i's patch to the canvas */
  apply: (i: number) => void;
  /** Handle disposal after frame i (call before applying next frame) */
  dispose: (i: number) => void;
  /** Reset compositor to initial state */
  reset: () => void;
  /** Get a snapshot (copy) of the current canvas state */
  getSnapshot: () => HTMLCanvasElement;
}
