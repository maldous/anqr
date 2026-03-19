import type { RGB } from "./rgb.contract";

export interface RGBWithMeta extends RGB {
  halftone?: boolean;
  sizeRatio?: number;
}
