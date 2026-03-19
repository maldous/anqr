import type { ShareConfig } from "@/contracts/share";
import type { UrlImportStore } from "./store-contract.types";

export function applyOverlayPreprocessingParams(
  params: Partial<ShareConfig>,
  store: UrlImportStore,
): void {
  if (params.colorMode) store.setOverlayColorMode(params.colorMode as "color" | "grayscale" | "bw");
  if (params.brightness !== undefined) store.setOverlayBrightness(params.brightness);
  if (params.contrast !== undefined) store.setOverlayContrast(params.contrast);
  if (params.gamma !== undefined) store.setOverlayGamma(params.gamma);
  if (params.saturation !== undefined) store.setOverlaySaturation(params.saturation);
  if (params.hue !== undefined) store.setOverlayHueRotate(params.hue);
  if (params.blur !== undefined) store.setOverlayBlur(params.blur);
  if (params.sharpen !== undefined) store.setOverlaySharpen(params.sharpen);
  if (params.posterize !== undefined) store.setOverlayPosterize(params.posterize);
  if (params.threshold !== undefined) store.setOverlayThreshold(params.threshold);
  if (params.edge) store.setOverlayEdgeDetect(params.edge as "off" | "sobel" | "canny");
  if (params.invert) store.setOverlayInvert(params.invert);
}
