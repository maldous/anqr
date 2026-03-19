import type { AnimationEffectConfig } from "./animation-effect-config.types";
import { computeAnimationProgress } from "./compute-animation-progress";

export function applyModuleAnimationToConfigServer(
  baseConfig: Record<string, unknown>,
  effects: AnimationEffectConfig[],
  frameIndex: number,
  totalFrames: number,
  baseJitter: number,
): Record<string, unknown> {
  if (!effects.length && baseJitter <= 0) {
    return { ...baseConfig, frameIndex, animationFrames: totalFrames };
  }

  const frameConfig: Record<string, unknown> = {
    ...baseConfig,
    frameIndex,
    animationFrames: totalFrames,
  };
  let jitter = Math.max(0, Number.isFinite(baseJitter) ? baseJitter : 0);
  let moduleGap = typeof frameConfig.moduleGap === "number" ? (frameConfig.moduleGap as number) : 0;
  let dotRotationDeg =
    typeof frameConfig.dotRotationDeg === "number" ? (frameConfig.dotRotationDeg as number) : 0;

  for (const effect of effects) {
    const progress = computeAnimationProgress(
      frameIndex,
      totalFrames,
      effect.easing,
      effect.reverse,
      effect.bounce,
    );
    const phase = Math.sin(progress * Math.PI * 2 + effect.seed * 0.013);
    const intensity = (phase + 1) / 2;
    switch (effect.pattern) {
      case "pulse":
        jitter += 0.35 + intensity * 0.75;
        moduleGap += intensity * 3.8;
        break;
      case "wave":
        jitter += 0.8 + intensity * 0.65;
        dotRotationDeg += (effect.waveAxis === "xy" ? 18 : 12) * phase;
        moduleGap += intensity * 2.4;
        break;
      case "scanline":
        jitter += intensity * 0.9;
        moduleGap += (1 - intensity) * 2.2;
        break;
      case "shimmer":
        jitter += (Math.sin((frameIndex + effect.seed * 3) * 1.7) + 1) * 0.42;
        dotRotationDeg += Math.cos((frameIndex + effect.seed) * 0.5) * 6;
        break;
      case "drift":
        jitter += 0.45 + intensity * 0.95;
        dotRotationDeg += phase * 10;
        break;
      case "color_cycle":
        jitter += 0.2 + intensity * 0.6;
        break;
      default:
        break;
    }
    if (effect.colorCycle) {
      jitter += 0.12;
    }
  }

  frameConfig.moduleJitterPx = Math.min(2.4, Math.max(0, Number(jitter.toFixed(3))));
  frameConfig.moduleGap = Math.min(35, Math.max(0, Number(moduleGap.toFixed(2))));
  frameConfig.dotRotationDeg = Math.round(dotRotationDeg);
  return frameConfig;
}
