import type { WatermarkBlend } from "./watermark.types";
import { setGlobalBlendMode } from "./set-global-blend-mode";

export function applyWatermarkBlendMode(
  ctx: CanvasRenderingContext2D,
  blend: WatermarkBlend,
): void {
  setGlobalBlendMode(ctx, blend);
}
