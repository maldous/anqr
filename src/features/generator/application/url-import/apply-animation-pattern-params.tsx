import type { ShareConfig } from '@/modules/share-links';
import { useQRStore } from '@/store/qr-store';

export function applyAnimationPatternParams(params: Partial<ShareConfig>): void {
  if (params.pattern)
    useQRStore.setState((s) => ({
      animation: { ...s.animation, pattern: params.pattern as any },
    }));
  if (params.target)
    useQRStore.setState((s) => ({
      animation: { ...s.animation, target: params.target as any },
    }));
  if (params.waveAxis)
    useQRStore.setState((s) => ({
      animation: { ...s.animation, waveAxis: params.waveAxis as any },
    }));
  if (params.pattern2)
    useQRStore.setState((s) => ({
      animation: { ...s.animation, pattern2: params.pattern2 as any },
    }));
  if (params.target2)
    useQRStore.setState((s) => ({
      animation: { ...s.animation, target2: params.target2 as any },
    }));
  if (params.waveAxis2)
    useQRStore.setState((s) => ({
      animation: { ...s.animation, waveAxis2: params.waveAxis2 as any },
    }));
  if (params.moduleJitter !== undefined)
    useQRStore.setState((s) => ({
      animation: { ...s.animation, moduleJitterPx: params.moduleJitter! },
    }));
  if (params.colorCycle)
    useQRStore.setState((s) => ({ animation: { ...s.animation, colorCycle: true } }));
  if (params.seed !== undefined)
    useQRStore.setState((s) => ({ animation: { ...s.animation, seed: params.seed! } }));
  if (params.animationSeed !== undefined)
    useQRStore.setState((s) => ({ animation: { ...s.animation, seed: params.animationSeed! } }));
}
