import type { ShareConfig } from "./types";

export function buildSvgFormatParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.svgTrueVector) params.set("svgVec", "1");
  if (config.svgShapePrecision && config.svgShapePrecision !== "pixel")
    params.set("svgPrec", config.svgShapePrecision);
  if (config.svgEmbedRasterOverlay === false) params.set("svgEmbed", "0");
}
