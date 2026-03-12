import { type ShareConfig } from '../../modules/share-links/types';
import { buildQRSettingsParams, buildColorParams, buildStyleParams, buildRenderParams, buildOverlayParams, buildPreprocessingParams, buildDitheringParams, buildSubpixelHalftoneParams, buildAnimationParams, buildOutputParams, buildSafetyParams, buildQAAutoTuneParams, buildWatermarkParams, buildServerAnimationParams, buildMetadataPaletteParams } from './url-params._internal';

/**
 * Build URL parameters from a config object
 */
export function buildUrlParams(config: Partial<ShareConfig>): string {
  const params = new URLSearchParams();

  if (config.data) params.set('data', config.data);
  if (config.lang && config.lang !== 'en') params.set('lang', config.lang);

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
