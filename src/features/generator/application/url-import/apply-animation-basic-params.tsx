import type { ShareConfig } from '@/modules/share-links';
import { useQRStore } from '@/store/qr-store';
import type { StoreState } from '@/features/generator/model/mobile-split';

export function applyAnimationBasicParams(params: Partial<ShareConfig>, store: StoreState): void {
  if (params.speed !== undefined) store.setAnimationSpeedMs(params.speed);
  if (params.loop === false) store.setAnimationLoop(false);
  if (params.reverse) store.setAnimationBounce(true);
  if (params.startFrame !== undefined) store.setAnimationStartFrame(params.startFrame);
  if (params.maxFrames !== undefined) store.setAnimationMaxFrames(params.maxFrames);
  if (params.frameStep !== undefined) store.setAnimationFrameStep(params.frameStep);
  if (params.interpolate)
    useQRStore.setState((s) => ({
      animation: { ...s.animation, interpolate: params.interpolate as any },
    }));
  if (params.temporalDither)
    useQRStore.setState((s) => ({
      animation: { ...s.animation, temporalDither: params.temporalDither as any },
    }));
}
