import type { OverlayFilterOptions } from "./overlay-filter-options.types";
import type { ServerQRRequestParams } from "./server-qr-request-params.types";

export function buildOverlayFilterOptionsFromServerParams(
  params: ServerQRRequestParams,
): OverlayFilterOptions {
  return {
    brightness: params.overlayBrightness,
    contrast: params.overlayContrast,
    gamma: params.overlayGamma,
    saturation: params.overlaySaturation,
    hue: params.overlayHueRotate,
    invert: params.overlayInvert,
    blur: params.overlayBlur,
    sharpen: params.overlaySharpen,
    posterize: params.overlayPosterize,
    threshold: params.overlayThreshold,
    edge: params.overlayEdgeDetect as OverlayFilterOptions["edge"],
  };
}
