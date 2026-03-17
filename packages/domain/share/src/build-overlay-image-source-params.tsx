import type { ShareConfig } from "./types";

export function buildOverlayImageSourceParams(
  config: Partial<ShareConfig>,
  params: URLSearchParams,
): void {
  if (config.overlayUrl) params.set("img", config.overlayUrl);
  if (config.overlayType && config.overlayType !== "static")
    params.set("ovType", config.overlayType);
  if (config.overlayFramePick && config.overlayFramePick !== "all")
    params.set("ovFramePick", config.overlayFramePick);
}
