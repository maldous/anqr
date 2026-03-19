import { type Canvas } from "@napi-rs/canvas";
import type { ParsedHandlerParams } from "./parsed-handler-params.types";
import type { WatermarkOptions } from "./watermark-options.types";

export function buildWatermarkOpts(
  p: ParsedHandlerParams,
  watermarkImageCanvas: Canvas | null,
): WatermarkOptions | null {
  if (!p.watermarkEnabled) return null;
  return {
    enabled: p.watermarkEnabled,
    kind: p.watermarkKind,
    text: p.watermarkText,
    imageCanvas: watermarkImageCanvas,
    position: p.watermarkPosition,
    opacity: p.watermarkOpacity,
    blend: p.watermarkBlend,
  };
}
