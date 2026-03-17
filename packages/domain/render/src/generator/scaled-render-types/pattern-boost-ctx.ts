import type { QRCodeInstance } from "@/modules/qr-generator/types";
import type { ContrastBoostFlags } from "./contrast-boost-flags";
import type { PixelColor } from "./pixel-color";

export interface PatternBoostCtx {
  ctx: CanvasRenderingContext2D;
  size: number;
  marginPx: number;
  effectiveModuleSize: number;
  subPixelSize: number;
  scaledSize: number;
  moduleCount: number;
  scale: number;
  finderStrengthN: number;
  blendPreservations: boolean;
  blendPreservationMode: "dither" | "overlay";
  isDitheredMode: boolean;
  bgLuma: number;
  ditherPaperOverlayMix: number;
  qr: QRCodeInstance;
  colors: (PixelColor | null)[][];
  matrix: boolean[][];
  functionalMap: Uint8Array;
  boostFlags: ContrastBoostFlags;
}
