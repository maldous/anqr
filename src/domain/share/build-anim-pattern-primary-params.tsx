import type { ShareConfig } from './types';

export function buildAnimPatternPrimaryParams(
  config: Partial<ShareConfig>,
  params: URLSearchParams
): void {
  if (config.pattern && config.pattern !== 'none') params.set('animPattern', config.pattern);
  if (config.target && config.target !== 'result') params.set('animTarget', config.target);
  if (config.waveAxis && config.waveAxis !== 'y') params.set('animWaveAxis', config.waveAxis);
}
