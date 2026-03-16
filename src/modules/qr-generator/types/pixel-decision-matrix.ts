import type { OverlayData } from "./overlay-data";
import type { RGBWithMeta } from "./rgb-with-meta";

export interface PixelDecisionMatrix {
  matrix: boolean[][];
  colors: (RGBWithMeta | null)[][];
  scale: number;
  overlayData: OverlayData | null;
  effectiveIntensity: number;
}
