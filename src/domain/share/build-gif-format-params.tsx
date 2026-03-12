import type { ShareConfig } from './types';

export function buildGifFormatParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.gifPaletteSize !== undefined && config.gifPaletteSize !== 256)
    params.set('gifPal', config.gifPaletteSize.toString());
  if (config.gifQuantizer && config.gifQuantizer !== 'median_cut')
    params.set('gifQuant', config.gifQuantizer);
  if (config.gifDither && config.gifDither !== 'floyd') params.set('gifDith', config.gifDither);
  if (config.gifDisposal && config.gifDisposal !== 'restore_background')
    params.set('gifDisp', config.gifDisposal);
  if (config.gifTransparentColor && config.gifTransparentColor !== '')
    params.set('gifTrans', config.gifTransparentColor.replace('#', ''));
}
