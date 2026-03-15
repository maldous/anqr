import type { ShareConfig } from './types';

export function buildSafetyLockParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.lockFinders === false) params.set('lockF', '0');
  if (config.lockTiming === false) params.set('lockT', '0');
  if (config.lockAlign === false) params.set('lockA', '0');
  if (config.lockFormat === false) params.set('lockFmt', '0');
  if (config.lockVersion === false) params.set('lockV', '0');
}
