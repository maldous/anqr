import type { ShareConfig } from './types';
import { buildHalftoneSpecificParams } from './build-halftone-specific-params';

export function buildSubpixelHalftoneParams(
  config: Partial<ShareConfig>,
  params: URLSearchParams
): void {
  if (config.subpixelGridSize && config.subpixelGridSize !== '3x3')
    params.set('spGrid', config.subpixelGridSize);
  if (config.subpixelCenterRule && config.subpixelCenterRule !== 'strict')
    params.set('spCenter', config.subpixelCenterRule);
  if (config.subpixelNeutralColor && config.subpixelNeutralColor !== '#808080')
    params.set('spNeutral', config.subpixelNeutralColor.replace('#', ''));
  if (config.subpixelFinderOverride && config.subpixelFinderOverride !== 'solid')
    params.set('spFinder', config.subpixelFinderOverride);
  buildHalftoneSpecificParams(config, params);
}
