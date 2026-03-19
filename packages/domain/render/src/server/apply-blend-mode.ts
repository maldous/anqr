import { type SKRSContext2D } from "@napi-rs/canvas";
import type { WatermarkBlend } from "./watermark-blend.types";
import { setGlobalBlendMode } from "../overlay/set-global-blend-mode";

export function applyBlendMode(ctx: SKRSContext2D, blend: WatermarkBlend): void {
  setGlobalBlendMode(ctx, blend);
}
