import { type AnimationEasing, type AnimationPattern } from "../../src/modules/animation";
import { AnimationTarget } from "./animation-target.types";
import { AnimationWaveAxis } from "./animation-wave-axis.types";

export type AnimationEffectConfig = {
  pattern: AnimationPattern;
  seed: number;
  easing: AnimationEasing;
  colorCycle: boolean;
  reverse: boolean;
  bounce: boolean;
  target: AnimationTarget;
  waveAxis: AnimationWaveAxis;
};
