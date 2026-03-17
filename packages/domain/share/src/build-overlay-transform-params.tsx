import type { ShareConfig } from "./types";

export function buildOverlayTransformParams(
  config: Partial<ShareConfig>,
  params: URLSearchParams,
): void {
  if (config.fit && config.fit !== "cover") params.set("fit", config.fit);
  if (config.rotate !== undefined && config.rotate !== 0)
    params.set("rot", config.rotate.toString());
  if (config.flipX) params.set("flipX", "1");
  if (config.flipY) params.set("flipY", "1");
}
