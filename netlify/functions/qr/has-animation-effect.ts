import { AnimationEffectConfig } from "./animation-effect-config.types";

export function hasAnimationEffect(effect: AnimationEffectConfig): boolean {
  return effect.pattern !== "none" || effect.colorCycle;
}
