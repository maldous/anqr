import type { ShareConfig } from "./types";

export function buildStyleParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.style && config.style !== "square") params.set("style", config.style);
  if (config.finder && config.finder !== "square") params.set("finder", config.finder);
  if (config.alignmentStyle && config.alignmentStyle !== "match_finder")
    params.set("align", config.alignmentStyle);
  if (config.timingStyle && config.timingStyle !== "match_module")
    params.set("timing", config.timingStyle);
}
