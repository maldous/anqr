import { ParsedHandlerParams } from "./parsed-handler-params.types.ts";
import { OverlayFilterOptions } from "./overlay-filter-options.types.ts";

export function buildFilterOptionsFromParams(p: ParsedHandlerParams): OverlayFilterOptions {
  return {
    brightness: p.overlayBrightness,
    contrast: p.overlayContrast,
    gamma: p.overlayGamma,
    saturation: p.overlaySaturation,
    hue: p.overlayHueRotate,
    invert: p.overlayInvert,
    blur: p.overlayBlur,
    sharpen: p.overlaySharpen,
    posterize: p.overlayPosterize,
    threshold: p.overlayThreshold,
    edge: p.overlayEdgeDetect as "off" | "sobel" | "canny",
  };
}
