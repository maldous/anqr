import { type Canvas, createCanvas } from "@napi-rs/canvas";
import type { WatermarkOptions } from "./watermark-options.types";
import { drawWatermarkLayerServer } from "./draw-watermark-layer-server";

export function applyWatermarkServer(source: Canvas, options: WatermarkOptions): Canvas {
  if (!options.enabled || (options.kind === "text" && !options.text)) {
    return source;
  }

  const result = createCanvas(source.width, source.height);
  const ctx = result.getContext("2d");

  // For 'behind' position, draw watermark first
  if (options.position === "behind") {
    drawWatermarkLayerServer(ctx, options, source.width, source.height);
    ctx.drawImage(source, 0, 0);
  } else {
    ctx.drawImage(source, 0, 0);
    drawWatermarkLayerServer(ctx, options, source.width, source.height);
  }

  return result;
}
