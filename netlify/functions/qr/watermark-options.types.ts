import { type Canvas } from "@napi-rs/canvas";
import { WatermarkKind } from "./watermark-kind.types.ts";
import { WatermarkPosition } from "./watermark-position.types.ts";
import { WatermarkBlend } from "./watermark-blend.types.ts";

export interface WatermarkOptions {
  enabled: boolean;
  kind: WatermarkKind;
  text: string;
  imageCanvas?: Canvas | null;
  position: WatermarkPosition;
  opacity: number;
  blend: WatermarkBlend;
}
