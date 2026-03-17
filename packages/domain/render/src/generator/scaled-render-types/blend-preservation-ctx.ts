import type { RGB } from "@/modules/qr-generator/types";

export interface BlendPreservationCtx {
  ctx: CanvasRenderingContext2D;
  size: number;
  marginPx: number;
  effectiveModuleSize: number;
  subPixelSize: number;
  scaledSize: number;
  moduleCount: number;
  finderStrengthN: number;
  blendPreservationMode: "dither" | "overlay";
  isDitheredMode: boolean;
  qr: { isDark(row: number, col: number): boolean };
  colors: (RGB | null)[][];
  getBlendTarget: (
    mRow: number,
    mCol: number,
    sRow: number,
    sCol: number,
  ) => { r: number; g: number; b: number };
  sampleModuleColor: (row: number, col: number) => RGB | null;
  estimatePaperLuma: (sampled: RGB | null) => number;
  blendChannelToward: (src: number, target: number, t: number) => number;
}
