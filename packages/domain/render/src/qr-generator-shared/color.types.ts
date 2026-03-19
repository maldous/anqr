export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface RGBWithMeta extends RGB {
  halftone?: boolean;
  sizeRatio?: number;
}
