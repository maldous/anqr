import type { ShareConfig } from "./types";

export function buildPreprocessingFilterParams(
  config: Partial<ShareConfig>,
  params: URLSearchParams,
): void {
  if (config.blur !== undefined && config.blur !== 0) params.set("blur", config.blur.toString());
  if (config.sharpen !== undefined && config.sharpen !== 0)
    params.set("sharpen", config.sharpen.toString());
  if (config.posterize !== undefined && config.posterize !== 0)
    params.set("posterize", config.posterize.toString());
  if (config.threshold !== undefined && config.threshold !== 128)
    params.set("threshold", config.threshold.toString());
  if (config.edge && config.edge !== "off") params.set("edge", config.edge);
  if (config.invert) params.set("invert", "1");
}
