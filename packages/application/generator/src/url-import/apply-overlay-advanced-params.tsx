import type { ShareConfig } from "@/contracts/share";
import type { UrlImportStore } from "./store-contract.types";

export function applyOverlayAdvancedParams(
  params: Partial<ShareConfig>,
  store: UrlImportStore,
): void {
  if (params.eccAwareEnabled)
    store.patchState((s) => ({ overlay: { ...s.overlay, eccAwareEnabled: true } }));
  if (params.eccAwareRiskBudget !== undefined)
    store.patchState((s) => ({
      overlay: { ...s.overlay, eccAwareRiskBudget: params.eccAwareRiskBudget! },
    }));
  if (params.eccAwareWeightMap)
    store.patchState((s) => ({
      overlay: {
        ...s.overlay,
        eccAwareWeightMap: params.eccAwareWeightMap as typeof s.overlay.eccAwareWeightMap,
      },
    }));
  if (params.overlayType)
    store.patchState((s) => ({
      overlay: { ...s.overlay, type: params.overlayType as typeof s.overlay.type },
    }));
  if (params.overlayFramePick)
    store.patchState((s) => ({
      overlay: { ...s.overlay, framePick: params.overlayFramePick as typeof s.overlay.framePick },
    }));
  if (params.cropEnabled)
    store.patchState((s) => ({ overlay: { ...s.overlay, cropEnabled: true } }));
  if (params.cropX !== undefined || params.cropY !== undefined || params.cropSize !== undefined) {
    store.patchState((s) => ({
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
    store.patchState((s) => ({ overlay: { ...s.overlay, gifUseFrameDelays: false } }));
  if (params.gifMaxFps !== undefined)
    store.patchState((s) => ({
      overlay: { ...s.overlay, gifMaxFps: params.gifMaxFps! },
    }));
  if (params.gifDisposalHandling)
    store.patchState((s) => ({
      overlay: {
        ...s.overlay,
        gifDisposalHandling: params.gifDisposalHandling as typeof s.overlay.gifDisposalHandling,
      },
    }));
}
