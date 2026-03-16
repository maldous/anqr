export type OutputLike = {
  format: string;
  gifPaletteSize: number;
  gifQuantizer: string;
  gifDither: string;
  gifTransparentColor?: string | null;
  svgTrueVector?: boolean;
  svgShapePrecision: string;
  svgEmbedRasterOverlay: boolean;
};
