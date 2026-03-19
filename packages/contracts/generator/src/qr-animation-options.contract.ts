import type { AnimationPatternType } from "./animation-pattern.contract";
import type { AnimationTarget } from "./animation-target.contract";
import type { AnimationWaveAxis } from "./animation-wave-axis.contract";

export interface QRAnimationOptions {
  speedMs: number;
  loop: boolean;
  bounce: boolean;
  startFrame: number;
  maxFrames: number;
  frameStep: number;
  interpolate: "none" | "crossfade" | "morph";
  temporalDither: "off" | "blue_noise" | "flicker_safe";
  seed: number;
  pattern: AnimationPatternType;
  target: AnimationTarget;
  waveAxis: AnimationWaveAxis;
  pattern2: AnimationPatternType;
  target2: AnimationTarget;
  waveAxis2: AnimationWaveAxis;
  moduleJitterPx: number;
  colorCycle: boolean;
}
