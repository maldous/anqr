import type { WatermarkBlend } from "./watermark-blend";
import type { WatermarkKind } from "./watermark-kind";
import type { WatermarkPosition } from "./watermark-position";

export interface WatermarkOptions {
  kind: WatermarkKind;
  text?: string;
  image?: HTMLCanvasElement | HTMLImageElement;
  position?: WatermarkPosition;
  opacity?: number;
  blend?: WatermarkBlend;
  scale?: number;
  padding?: number;
  font?: string;
  color?: string;
  tiled?: boolean;
}
