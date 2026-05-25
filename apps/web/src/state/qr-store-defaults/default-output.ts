import type { QRState } from "../qr-store";

export const DEFAULT_OUTPUT: QRState["output"] = {
  format: "gif",
  widthPx: 400,
  heightPx: 400,
  quality: 0.9,
  filename: "anqr-qrcode",
  includeQuietZone: true,
  dpi: 72,
  bgOverride: "",
  gifPaletteSize: 256,
  gifQuantizer: "median_cut",
  gifDither: "floyd",
  gifTransparentColor: "",
  gifDisposal: "keep",
  svgTrueVector: false,
  svgShapePrecision: "pixel",
  svgEmbedRasterOverlay: true,
  svgMetadata: {},
  formatExtra: "none",
};
