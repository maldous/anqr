import type { ShareConfig } from './types';

export function buildMetadataPaletteParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.metaTitle) params.set('metaTitle', config.metaTitle);
  if (config.metaAuthor) params.set('metaAuthor', config.metaAuthor);
  if (config.metaCopyright) params.set('metaCopy', config.metaCopyright);
  if (config.metaLicense) params.set('metaLic', config.metaLicense);
  if (config.metaDescription) params.set('metaDesc', config.metaDescription);
  if (config.metaCreationTime) params.set('metaTime', '1');
  if (config.metaCustomKv) params.set('metaKv', config.metaCustomKv);
  if (config.palette) params.set('palette', config.palette);
  if (config.paletteMode && config.paletteMode !== 'position')
    params.set('paletteMode', config.paletteMode);
}
