import type { ShareConfig } from "@/modules/share-links";
import type {
  AnimationPatternType,
  AnimationTarget,
  AnimationWaveAxis,
} from "./qr-state-compat.types";
import type { UrlImportStore } from "./store-contract.types";

export function applyAnimationPatternParams(
  params: Partial<ShareConfig>,
  store: UrlImportStore,
): void {
  if (params.pattern)
    store.patchState((s) => ({
      animation: { ...s.animation, pattern: params.pattern as AnimationPatternType },
    }));
  if (params.target)
    store.patchState((s) => ({
      animation: { ...s.animation, target: params.target as AnimationTarget },
    }));
  if (params.waveAxis)
    store.patchState((s) => ({
      animation: { ...s.animation, waveAxis: params.waveAxis as AnimationWaveAxis },
    }));
  if (params.pattern2)
    store.patchState((s) => ({
      animation: { ...s.animation, pattern2: params.pattern2 as AnimationPatternType },
    }));
  if (params.target2)
    store.patchState((s) => ({
      animation: { ...s.animation, target2: params.target2 as AnimationTarget },
    }));
  if (params.waveAxis2)
    store.patchState((s) => ({
      animation: { ...s.animation, waveAxis2: params.waveAxis2 as AnimationWaveAxis },
    }));
  if (params.moduleJitter !== undefined)
    store.patchState((s) => ({
      animation: { ...s.animation, moduleJitterPx: params.moduleJitter! },
    }));
  if (params.colorCycle)
    store.patchState((s) => ({ animation: { ...s.animation, colorCycle: true } }));
  if (params.seed !== undefined)
    store.patchState((s) => ({ animation: { ...s.animation, seed: params.seed! } }));
  if (params.animationSeed !== undefined)
    store.patchState((s) => ({
      animation: { ...s.animation, seed: params.animationSeed! },
    }));
}
