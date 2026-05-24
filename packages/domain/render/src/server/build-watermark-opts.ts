import { type Canvas } from "@napi-rs/canvas";
import type { ParsedHandlerParams } from "./parsed-handler-params.types";
import type { WatermarkOptions } from "./watermark-options.types";
import { createTextWatermark } from "./create-text-watermark";

export function buildWatermarkOpts(
  p: ParsedHandlerParams,
  watermarkImageCanvas: Canvas | null,
): WatermarkOptions | null {
  if (!p.watermarkEnabled) return null;
  // For text watermarks, render the text canvas once here (was previously
  // re-rendered per frame inside drawWatermarkLayerServer — see
  // review-2026-05-24 A-F3). Image/pattern watermarks already pass in a
  // pre-built imageCanvas.
  const cachedImageCanvas =
    p.watermarkKind === "text" && p.watermarkText
      ? createTextWatermark(p.watermarkText, 14, "sans-serif", "#000000")
      : watermarkImageCanvas;
  return {
    enabled: p.watermarkEnabled,
    kind: p.watermarkKind,
    text: p.watermarkText,
    imageCanvas: cachedImageCanvas,
    position: p.watermarkPosition,
    opacity: p.watermarkOpacity,
    blend: p.watermarkBlend,
  };
}
