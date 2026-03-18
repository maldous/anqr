import type { ShareConfig } from "@/modules/share-links";
import { useQRStore, type QRState } from "@/store/qr-store";
import { log } from "./log";

export function applyRenderColorAndPaletteStyles(params: Partial<ShareConfig>): void {
  if (params.perModuleColorMode)
    useQRStore.setState((s: QRState) => ({
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
    useQRStore.setState((s: QRState) => ({ render: { ...s.render, contrastGuard: true } }));
  if (params.minContrastRatio !== undefined)
    useQRStore.setState((s: QRState) => ({
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
        useQRStore.setState((s: QRState) => ({ render: { ...s.render, palette: paletteArray } }));
      }
    } catch (e) {
      log.warn("Failed to parse palette", { error: e });
    }
  }
  if (params.paletteMode)
    useQRStore.setState((s: QRState) => ({
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
