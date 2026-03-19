import { type AnimationEasing, type AnimationPattern } from "@/modules/animation";
import type { AnimationTarget } from "./animation-target.types";
import type { AnimationWaveAxis } from "./animation-wave-axis.types";

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
