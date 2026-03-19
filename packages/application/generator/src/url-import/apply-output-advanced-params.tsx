import type { ShareConfig } from "@/contracts/share";
import type { UrlImportStore } from "./store-contract.types";

export function applyOutputAdvancedParams(
  params: Partial<ShareConfig>,
  store: UrlImportStore,
): void {
  if (params.svgTrueVector) store.setOutputSvgTrueVector(true);
  if (params.dpi !== undefined)
    store.patchState((s) => ({ output: { ...s.output, dpi: params.dpi! } }));
  if (params.includeQuietZone === false)
    store.patchState((s) => ({ output: { ...s.output, includeQuietZone: false } }));
  if (params.bgOverride)
    store.patchState((s) => ({
      output: { ...s.output, bgOverride: params.bgOverride! },
    }));
  if (params.gifTransparentColor)
    store.patchState((s) => ({
      output: { ...s.output, gifTransparentColor: params.gifTransparentColor! },
    }));
  if (params.svgShapePrecision)
    store.patchState((s) => ({
      output: { ...s.output, svgShapePrecision: params.svgShapePrecision as "pixel" | "precise" },
    }));
  if (params.svgEmbedRasterOverlay === false)
    store.patchState((s) => ({
      output: { ...s.output, svgEmbedRasterOverlay: false },
    }));
  if (params.formatExtra)
    store.patchState((s) => ({
      output: { ...s.output, formatExtra: params.formatExtra as "none" | "eps" | "animated_webp" },
    }));
}
