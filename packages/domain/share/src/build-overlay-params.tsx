import type { ShareConfig } from "./types";
import { buildOverlayImageParams } from "./build-overlay-image-params";
import { buildOverlayTransformParams } from "./build-overlay-transform-params";
import { buildOverlayProtectionParams } from "./build-overlay-protection-params";

export function buildOverlayParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.overlayUrl) {
    params.set("mode", config.mode || "dithered");
  } else if (config.mode && config.mode !== "dithered") {
    params.set("mode", config.mode);
  }
  if (config.intensity !== undefined && config.intensity !== 100)
    params.set("intensity", config.intensity.toString());
  if (config.logoSize !== undefined && config.logoSize !== 25)
    params.set("logoSize", config.logoSize.toString());
  buildOverlayImageParams(config, params);
  buildOverlayTransformParams(config, params);
  buildOverlayProtectionParams(config, params);
}
