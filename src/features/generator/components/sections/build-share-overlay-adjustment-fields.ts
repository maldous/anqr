import type { StoreState } from "./share-config-store.types";

export function buildShareOverlayAdjustmentFields(overlay: StoreState["overlay"]) {
  return {
    colorMode: overlay.colorMode === "color" ? undefined : overlay.colorMode,
    brightness: overlay.brightness === 0 ? undefined : overlay.brightness,
    contrast: overlay.contrast === 0 ? undefined : overlay.contrast,
    gamma: overlay.gamma === 1 ? undefined : overlay.gamma,
    saturation: overlay.saturation === 0 ? undefined : overlay.saturation,
    hue: overlay.hueRotateDeg === 0 ? undefined : overlay.hueRotateDeg,
    blur: overlay.blurPx === 0 ? undefined : overlay.blurPx,
    sharpen: overlay.sharpen === 0 ? undefined : overlay.sharpen,
    posterize: overlay.posterizeLevels === 0 ? undefined : overlay.posterizeLevels,
    threshold: overlay.threshold === 128 ? undefined : overlay.threshold,
    edge: overlay.edgeDetect === "off" ? undefined : overlay.edgeDetect,
    invert: overlay.invert || undefined,
  };
}
