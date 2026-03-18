import type { ShareConfig } from "@/modules/share-links";
import { useQRStore, type QRState } from "@/store/qr-store";

export function applyOverlayAdvancedParams(params: Partial<ShareConfig>): void {
  if (params.eccAwareEnabled)
    useQRStore.setState((s: QRState) => ({ overlay: { ...s.overlay, eccAwareEnabled: true } }));
  if (params.eccAwareRiskBudget !== undefined)
    useQRStore.setState((s: QRState) => ({
      overlay: { ...s.overlay, eccAwareRiskBudget: params.eccAwareRiskBudget! },
    }));
  if (params.eccAwareWeightMap)
    useQRStore.setState((s: QRState) => ({
      overlay: {
        ...s.overlay,
        eccAwareWeightMap: params.eccAwareWeightMap as typeof s.overlay.eccAwareWeightMap,
      },
    }));
  if (params.overlayType)
    useQRStore.setState((s: QRState) => ({
      overlay: { ...s.overlay, type: params.overlayType as typeof s.overlay.type },
    }));
  if (params.overlayFramePick)
    useQRStore.setState((s: QRState) => ({
      overlay: { ...s.overlay, framePick: params.overlayFramePick as typeof s.overlay.framePick },
    }));
  if (params.cropEnabled)
    useQRStore.setState((s: QRState) => ({ overlay: { ...s.overlay, cropEnabled: true } }));
  if (params.cropX !== undefined || params.cropY !== undefined || params.cropSize !== undefined) {
    useQRStore.setState((s: QRState) => ({
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
    useQRStore.setState((s: QRState) => ({ overlay: { ...s.overlay, gifUseFrameDelays: false } }));
  if (params.gifMaxFps !== undefined)
    useQRStore.setState((s: QRState) => ({ overlay: { ...s.overlay, gifMaxFps: params.gifMaxFps! } }));
  if (params.gifDisposalHandling)
    useQRStore.setState((s: QRState) => ({
      overlay: {
        ...s.overlay,
        gifDisposalHandling: params.gifDisposalHandling as typeof s.overlay.gifDisposalHandling,
      },
    }));
}
