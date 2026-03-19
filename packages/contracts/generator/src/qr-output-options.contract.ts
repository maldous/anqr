import type { GifDither } from "./gif-dither.contract";
import type { GifQuantizer } from "./gif-quantizer.contract";
import type { OutputFormat } from "./output-format.contract";

export interface QROutputOptions {
  format: OutputFormat;
  widthPx: number;
  heightPx: number;
  quality: number;
  filename: string;
  includeQuietZone: boolean;
  dpi: number;
  bgOverride: string;
  gifPaletteSize: number;
  gifQuantizer: GifQuantizer;
  gifDither: GifDither;
  gifTransparentColor: string;
  gifDisposal: string;
  svgTrueVector: boolean;
  svgShapePrecision: number | string;
  svgEmbedRasterOverlay: boolean;
}
