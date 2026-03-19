import type { ShareConfig } from "@/modules/share-links";
import type { UrlImportStore } from "./store-contract.types";

export function applyAnimationBasicParams(
  params: Partial<ShareConfig>,
  store: UrlImportStore,
): void {
  if (params.speed !== undefined) store.setAnimationSpeedMs(params.speed);
  if (params.loop === false) store.setAnimationLoop(false);
  if (params.reverse) store.setAnimationBounce(true);
  if (params.startFrame !== undefined) store.setAnimationStartFrame(params.startFrame);
  if (params.maxFrames !== undefined) store.setAnimationMaxFrames(params.maxFrames);
  if (params.frameStep !== undefined) store.setAnimationFrameStep(params.frameStep);
  if (params.interpolate)
    store.patchState((s) => ({
      animation: {
        ...s.animation,
        interpolate: params.interpolate as typeof s.animation.interpolate,
      },
    }));
  if (params.temporalDither)
    store.patchState((s) => ({
      animation: {
        ...s.animation,
        temporalDither: params.temporalDither as typeof s.animation.temporalDither,
      },
    }));
}
