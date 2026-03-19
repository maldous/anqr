import type { ShareConfig } from "@/modules/share-links";
import type { UrlImportStore } from "./store-contract.types";

export function applyWatermarkParams(params: Partial<ShareConfig>, store: UrlImportStore): void {
  if (params.watermarkEnabled)
    store.patchState((s) => ({ watermark: { ...s.watermark, enabled: true } }));
  if (params.watermarkKind)
    store.patchState((s) => ({
      watermark: { ...s.watermark, kind: params.watermarkKind as typeof s.watermark.kind },
    }));
  if (params.watermarkText)
    store.patchState((s) => ({
      watermark: { ...s.watermark, text: params.watermarkText! },
    }));
  if (params.watermarkPosition)
    store.patchState((s) => ({
      watermark: {
        ...s.watermark,
        position: params.watermarkPosition as typeof s.watermark.position,
      },
    }));
  if (params.watermarkOpacity !== undefined)
    store.patchState((s) => ({
      watermark: { ...s.watermark, opacity: params.watermarkOpacity! },
    }));
  if (params.watermarkBlend)
    store.patchState((s) => ({
      watermark: { ...s.watermark, blend: params.watermarkBlend as typeof s.watermark.blend },
    }));
}
