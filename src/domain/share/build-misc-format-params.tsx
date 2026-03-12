import type { ShareConfig } from './types';

export function buildMiscFormatParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.dpi !== undefined && config.dpi !== 72) params.set('dpi', config.dpi.toString());
  if (config.includeQuietZone === false) params.set('inclQz', '0');
  if (config.bgOverride && config.bgOverride !== '')
    params.set('bgOver', config.bgOverride.replace('#', ''));
  if (config.formatExtra && config.formatExtra !== 'none')
    params.set('fmtExtra', config.formatExtra);
}
