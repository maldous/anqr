import { type Canvas } from "@napi-rs/canvas";
import { WatermarkKind } from "./watermark-kind.types";
import { WatermarkPosition } from "./watermark-position.types";
import { WatermarkBlend } from "./watermark-blend.types";

export interface WatermarkOptions {
  enabled: boolean;
  kind: WatermarkKind;
  text: string;
  imageCanvas?: Canvas | null;
  position: WatermarkPosition;
  opacity: number;
  blend: WatermarkBlend;
}
