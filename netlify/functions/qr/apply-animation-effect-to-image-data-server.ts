import {
  applyAnimationColorCycle,
  applyAnimationDrift,
  applyAnimationPulse,
  applyAnimationScanline,
  applyAnimationShimmer,
} from "../../../src/modules/animation";
import { AnimationEffectConfig } from "./animation-effect-config.types";
import { applyAnimationWaveWithAxisServer } from "./apply-animation-wave-with-axis-server";

export function applyAnimationEffectToImageDataServer(
  frameData: Uint8ClampedArray,
  width: number,
  height: number,
  progress: number,
  effect: AnimationEffectConfig,
): void {
  switch (effect.pattern) {
    case "pulse":
      applyAnimationPulse(frameData, progress, effect.seed);
      break;
    case "wave":
      applyAnimationWaveWithAxisServer(
        frameData,
        progress,
        width,
        height,
        effect.seed,
        effect.waveAxis,
      );
      break;
    case "scanline":
      applyAnimationScanline(frameData, progress, width, height, effect.seed);
      break;
    case "shimmer":
      applyAnimationShimmer(frameData, progress, width, height, effect.seed);
      break;
    case "drift":
      applyAnimationDrift(frameData, progress, width, height, effect.seed);
      break;
    case "color_cycle":
      applyAnimationColorCycle(frameData, progress, effect.seed);
      break;
    default:
      break;
  }

  if (effect.colorCycle && effect.pattern !== "color_cycle") {
    applyAnimationColorCycle(frameData, progress, effect.seed + 101);
  }
}
