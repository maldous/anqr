import type { ShareConfig } from "./types";

export function buildSafetyIntensityParams(
  config: Partial<ShareConfig>,
  params: URLSearchParams,
): void {
  if (config.maxOverlayIntensityL !== undefined && config.maxOverlayIntensityL !== 100)
    params.set("maxIntL", config.maxOverlayIntensityL.toString());
  if (config.maxOverlayIntensityM !== undefined && config.maxOverlayIntensityM !== 100)
    params.set("maxIntM", config.maxOverlayIntensityM.toString());
  if (config.maxOverlayIntensityQ !== undefined && config.maxOverlayIntensityQ !== 100)
    params.set("maxIntQ", config.maxOverlayIntensityQ.toString());
  if (config.maxOverlayIntensityH !== undefined && config.maxOverlayIntensityH !== 100)
    params.set("maxIntH", config.maxOverlayIntensityH.toString());
}
