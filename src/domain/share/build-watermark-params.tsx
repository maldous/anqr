import type { ShareConfig } from './types';

export function buildWatermarkParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.watermarkEnabled) params.set('wmEn', '1');
  if (config.watermarkKind && config.watermarkKind !== 'text')
    params.set('wmKind', config.watermarkKind);
  if (config.watermarkText) params.set('wmText', config.watermarkText);
  if (config.watermarkPosition && config.watermarkPosition !== 'center')
    params.set('wmPos', config.watermarkPosition);
  if (config.watermarkOpacity !== undefined && config.watermarkOpacity !== 50)
    params.set('wmOpacity', config.watermarkOpacity.toString());
  if (config.watermarkBlend && config.watermarkBlend !== 'normal')
    params.set('wmBlend', config.watermarkBlend);
  if (config.watermarkImageUrl) params.set('wmImg', config.watermarkImageUrl);
}
