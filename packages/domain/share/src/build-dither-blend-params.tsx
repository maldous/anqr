import type { ShareConfig } from "./types";

export function buildDitherBlendParams(
  config: Partial<ShareConfig>,
  params: URLSearchParams,
): void {
  if (config.blendPreservations) params.set("blendPres", "1");
  if (
    config.blendPreservations &&
    config.blendPreservationMode &&
    config.blendPreservationMode !== "overlay"
  ) {
    params.set("blendPresMode", config.blendPreservationMode);
  }
}
