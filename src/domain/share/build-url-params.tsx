import { type ShareConfig } from "../../modules/share-links/types";
import { buildAnimationParams } from "./build-animation-params";
import { buildColorParams } from "./build-color-params";
import { buildDitheringParams } from "./build-dithering-params";
import { buildMetadataPaletteParams } from "./build-metadata-palette-params";
import { buildOutputParams } from "./build-output-params";
import { buildOverlayParams } from "./build-overlay-params";
import { buildPreprocessingParams } from "./build-preprocessing-params";
import { buildQAAutoTuneParams } from "./build-qa-auto-tune-params";
import { buildQRSettingsParams } from "./build-qr-settings-params";
import { buildRenderParams } from "./build-render-params";
import { buildSafetyParams } from "./build-safety-params";
import { buildServerAnimationParams } from "./build-server-animation-params";
import { buildStyleParams } from "./build-style-params";
import { buildSubpixelHalftoneParams } from "./build-subpixel-halftone-params";
import { buildWatermarkParams } from "./build-watermark-params";

/**
 * Build URL parameters from a config object
 */
export function buildUrlParams(config: Partial<ShareConfig>): string {
  const params = new URLSearchParams();

  if (config.data) params.set("data", config.data);
  if (config.lang && config.lang !== "en") params.set("lang", config.lang);

  buildQRSettingsParams(config, params);
  buildColorParams(config, params);
  buildStyleParams(config, params);
  buildRenderParams(config, params);
  buildOverlayParams(config, params);
  buildPreprocessingParams(config, params);
  buildDitheringParams(config, params);
  buildSubpixelHalftoneParams(config, params);
  buildAnimationParams(config, params);
  buildOutputParams(config, params);
  buildSafetyParams(config, params);
  buildQAAutoTuneParams(config, params);
  buildWatermarkParams(config, params);
  buildServerAnimationParams(config, params);
  buildMetadataPaletteParams(config, params);

  return params.toString();
}
