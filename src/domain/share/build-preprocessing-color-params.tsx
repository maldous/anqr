import type { ShareConfig } from './types';

export function buildPreprocessingColorParams(
  config: Partial<ShareConfig>,
  params: URLSearchParams
): void {
  if (config.colorMode && config.colorMode !== 'color') params.set('colorMode', config.colorMode);
  if (config.brightness !== undefined && config.brightness !== 0)
    params.set('brightness', config.brightness.toString());
  if (config.contrast !== undefined && config.contrast !== 0)
    params.set('contrast', config.contrast.toString());
  if (config.gamma !== undefined && config.gamma !== 1)
    params.set('gamma', config.gamma.toString());
  if (config.saturation !== undefined && config.saturation !== 0)
    params.set('saturation', config.saturation.toString());
  if (config.hue !== undefined && config.hue !== 0) params.set('hue', config.hue.toString());
}
