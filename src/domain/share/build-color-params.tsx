import type { ShareConfig } from './types';

export function buildColorParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.fg && config.fg !== '#000000') params.set('fg', config.fg.replace('#', ''));
  if (config.bg && config.bg !== '#ffffff') params.set('bg', config.bg.replace('#', ''));
  if (config.transparent) params.set('transparent', '1');
}
