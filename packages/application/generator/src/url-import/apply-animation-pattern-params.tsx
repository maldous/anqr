import type { ShareConfig } from "@/modules/share-links";
import {
  useQRStore,
  type AnimationPatternType,
  type AnimationTarget,
  type AnimationWaveAxis,
  type QRState,
} from "@/store/qr-store";

export function applyAnimationPatternParams(params: Partial<ShareConfig>): void {
  if (params.pattern)
    useQRStore.setState((s: QRState) => ({
      animation: { ...s.animation, pattern: params.pattern as AnimationPatternType },
    }));
  if (params.target)
    useQRStore.setState((s: QRState) => ({
      animation: { ...s.animation, target: params.target as AnimationTarget },
    }));
  if (params.waveAxis)
    useQRStore.setState((s: QRState) => ({
      animation: { ...s.animation, waveAxis: params.waveAxis as AnimationWaveAxis },
    }));
  if (params.pattern2)
    useQRStore.setState((s: QRState) => ({
      animation: { ...s.animation, pattern2: params.pattern2 as AnimationPatternType },
    }));
  if (params.target2)
    useQRStore.setState((s: QRState) => ({
      animation: { ...s.animation, target2: params.target2 as AnimationTarget },
    }));
  if (params.waveAxis2)
    useQRStore.setState((s: QRState) => ({
      animation: { ...s.animation, waveAxis2: params.waveAxis2 as AnimationWaveAxis },
    }));
  if (params.moduleJitter !== undefined)
    useQRStore.setState((s: QRState) => ({
      animation: { ...s.animation, moduleJitterPx: params.moduleJitter! },
    }));
  if (params.colorCycle)
    useQRStore.setState((s: QRState) => ({ animation: { ...s.animation, colorCycle: true } }));
  if (params.seed !== undefined)
    useQRStore.setState((s: QRState) => ({ animation: { ...s.animation, seed: params.seed! } }));
  if (params.animationSeed !== undefined)
    useQRStore.setState((s: QRState) => ({ animation: { ...s.animation, seed: params.animationSeed! } }));
}
