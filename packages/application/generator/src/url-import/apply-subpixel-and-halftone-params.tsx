import type { ShareConfig } from "@/modules/share-links";
import type { UrlImportStore } from "./store-contract.types";

export function applySubpixelAndHalftoneParams(
  params: Partial<ShareConfig>,
  store: UrlImportStore,
): void {
  if (params.subpixelGridSize)
    store.patchState((s) => ({
      overlay: { ...s.overlay, subpixelGridSize: params.subpixelGridSize as "2x2" | "3x3" | "4x4" },
    }));
  if (params.subpixelCenterRule)
    store.patchState((s) => ({
      overlay: {
        ...s.overlay,
        subpixelCenterRule: params.subpixelCenterRule as "strict" | "halftone_center",
      },
    }));
  if (params.subpixelNeutralColor)
    store.patchState((s) => ({
      overlay: { ...s.overlay, subpixelNeutralColor: params.subpixelNeutralColor! },
    }));
  if (params.subpixelFinderOverride)
    store.patchState((s) => ({
      overlay: {
        ...s.overlay,
        subpixelFinderOverride: params.subpixelFinderOverride as "solid" | "stylized",
      },
    }));
  if (params.halftoneCell)
    store.patchState((s) => ({
      overlay: { ...s.overlay, halftoneCell: params.halftoneCell as "per_module" | "n×n" },
    }));
  if (params.halftoneDotShape)
    store.patchState((s) => ({
      overlay: {
        ...s.overlay,
        halftoneDotShape: params.halftoneDotShape as "circle" | "square" | "line",
      },
    }));
  if (params.brightnessCurve)
    store.patchState((s) => ({
      overlay: {
        ...s.overlay,
        brightnessCurve: params.brightnessCurve as "linear" | "s-curve" | "gamma",
      },
    }));
  if (params.duotoneColor1) {
    const color1 = params.duotoneColor1;
    store.patchState((s) => ({
      overlay: {
        ...s.overlay,
        duotoneColors: [color1, s.overlay.duotoneColors[1]],
      },
    }));
  }
  if (params.duotoneColor2) {
    const color2 = params.duotoneColor2;
    store.patchState((s) => ({
      overlay: {
        ...s.overlay,
        duotoneColors: [s.overlay.duotoneColors[0], color2],
      },
    }));
  }
}
