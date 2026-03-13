import type { AnimationPattern } from './animation-pattern';

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
