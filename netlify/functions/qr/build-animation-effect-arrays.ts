import { AnimationEffectConfig } from "./animation-effect-config.types";
import { AnimationTemporalDitherMode } from "./animation-temporal-dither-mode.types";
import { hasAnimationEffect } from "./has-animation-effect";

export function buildAnimationEffectArrays(
  primaryEffect: AnimationEffectConfig,
  secondaryEffect: AnimationEffectConfig,
  temporalDither: AnimationTemporalDitherMode,
): {
  animationEffects: AnimationEffectConfig[];
  moduleAnimationEffects: AnimationEffectConfig[];
  resultAnimationEffects: AnimationEffectConfig[];
  hasAnyAnimationEffects: boolean;
} {
  const animationEffects: AnimationEffectConfig[] = [];
  if (hasAnimationEffect(primaryEffect)) {
    animationEffects.push(primaryEffect);
  }
  if (hasAnimationEffect(secondaryEffect)) {
    animationEffects.push(secondaryEffect);
  }
  const moduleAnimationEffects = animationEffects.filter(
    (effect) => effect.target === "modules" || effect.target === "both",
  );
  const resultAnimationEffects = animationEffects.filter(
    (effect) => effect.target === "result" || effect.target === "both",
  );
  return {
    animationEffects,
    moduleAnimationEffects,
    resultAnimationEffects,
    hasAnyAnimationEffects: animationEffects.length > 0 || temporalDither !== "off",
  };
}
