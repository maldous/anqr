import type { RGB } from "@/domain/share";

export type { RGB } from "@/domain/share";

export interface RGBWithMeta extends RGB {
  halftone?: boolean;
  sizeRatio?: number;
}
