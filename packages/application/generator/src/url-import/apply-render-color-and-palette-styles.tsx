import type { ShareConfig } from "@/modules/share-links";
import type { UrlImportStore } from "./store-contract.types";
import { log } from "./log";

export function applyRenderColorAndPaletteStyles(
  params: Partial<ShareConfig>,
  store: UrlImportStore,
): void {
  if (params.perModuleColorMode)
    store.patchState((s) => ({
      render: {
        ...s.render,
        perModuleColorMode: params.perModuleColorMode as
          | "solid"
          | "by_brightness"
          | "by_position"
          | "by_overlay"
          | "by_cluster",
      },
    }));
  if (params.contrastGuard)
    store.patchState((s) => ({ render: { ...s.render, contrastGuard: true } }));
  if (params.minContrastRatio !== undefined)
    store.patchState((s) => ({
      render: { ...s.render, minContrastRatio: params.minContrastRatio! },
    }));
  if (params.palette) {
    try {
      let paletteArray: string[];
      if (params.palette.startsWith("[")) {
        paletteArray = JSON.parse(params.palette);
      } else {
        paletteArray = params.palette.split(",").map((c) => (c.startsWith("#") ? c : `#${c}`));
      }
      if (Array.isArray(paletteArray) && paletteArray.length > 0) {
        store.patchState((s) => ({ render: { ...s.render, palette: paletteArray } }));
      }
    } catch (e) {
      log.warn("Failed to parse palette", { error: e });
    }
  }
  if (params.paletteMode)
    store.patchState((s) => ({
      render: {
        ...s.render,
        paletteMode: params.paletteMode as
          | "position"
          | "brightness"
          | "diagonal"
          | "radial"
          | "random"
          | "row"
          | "column",
      },
    }));
}
