import { type Canvas } from "@napi-rs/canvas";
import type { WatermarkKind } from "./watermark-kind.types";
import type { WatermarkPosition } from "./watermark-position.types";
import type { WatermarkBlend } from "./watermark-blend.types";

export interface WatermarkOptions {
  enabled: boolean;
  kind: WatermarkKind;
  text: string;
  imageCanvas?: Canvas | null;
  position: WatermarkPosition;
  opacity: number;
  blend: WatermarkBlend;
}
