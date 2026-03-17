import type { RGB } from "./rgb";

export interface RGBWithMeta extends RGB {
  halftone?: boolean;
  sizeRatio?: number;
}
