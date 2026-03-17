import type { ShareConfig } from "./types";

export function buildOutputQualityParams(
  config: Partial<ShareConfig>,
  params: URLSearchParams,
): void {
  if (config.quality !== undefined && config.quality !== 0.9)
    params.set("quality", config.quality.toString());
  if (config.jpegQuality !== undefined && config.jpegQuality !== 92)
    params.set("jpegQ", config.jpegQuality.toString());
  if (config.webpQuality !== undefined && config.webpQuality !== 90)
    params.set("webpQ", config.webpQuality.toString());
  if (config.gifColors !== undefined && config.gifColors !== 256)
    params.set("gifColors", config.gifColors.toString());
}
