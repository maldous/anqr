import type { ShareConfig } from '@/modules/share-links';
import { useQRStore } from '@/store/qr-store';

export function applyOverlayAdvancedParams(params: Partial<ShareConfig>): void {
  if (params.eccAwareEnabled)
    useQRStore.setState((s) => ({ overlay: { ...s.overlay, eccAwareEnabled: true } }));
  if (params.eccAwareRiskBudget !== undefined)
    useQRStore.setState((s) => ({
      overlay: { ...s.overlay, eccAwareRiskBudget: params.eccAwareRiskBudget! },
    }));
  if (params.eccAwareWeightMap)
    useQRStore.setState((s) => ({
      overlay: { ...s.overlay, eccAwareWeightMap: params.eccAwareWeightMap as any },
    }));
  if (params.overlayType)
    useQRStore.setState((s) => ({ overlay: { ...s.overlay, type: params.overlayType as any } }));
  if (params.overlayFramePick)
    useQRStore.setState((s) => ({
      overlay: { ...s.overlay, framePick: params.overlayFramePick as any },
    }));
  if (params.cropEnabled)
    useQRStore.setState((s) => ({ overlay: { ...s.overlay, cropEnabled: true } }));
  if (params.cropX !== undefined || params.cropY !== undefined || params.cropSize !== undefined) {
    useQRStore.setState((s) => ({
      overlay: {
        ...s.overlay,
        cropRegion: {
          x: params.cropX ?? s.overlay.cropRegion.x,
          y: params.cropY ?? s.overlay.cropRegion.y,
          size: params.cropSize ?? s.overlay.cropRegion.size,
        },
      },
    }));
  }
  if (params.gifUseFrameDelays === false)
    useQRStore.setState((s) => ({ overlay: { ...s.overlay, gifUseFrameDelays: false } }));
  if (params.gifMaxFps !== undefined)
    useQRStore.setState((s) => ({ overlay: { ...s.overlay, gifMaxFps: params.gifMaxFps! } }));
  if (params.gifDisposalHandling)
    useQRStore.setState((s) => ({
      overlay: { ...s.overlay, gifDisposalHandling: params.gifDisposalHandling as any },
    }));
}
