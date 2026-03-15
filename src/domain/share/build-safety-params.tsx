import type { ShareConfig } from './types';
import { buildSafetyLockParams } from './build-safety-lock-params';
import { buildSafetyIntensityParams } from './build-safety-intensity-params';

export function buildSafetyParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.safetyMode && config.safetyMode !== 'off') params.set('safeMode', config.safetyMode);
  if (config.safetyMinModulePx !== undefined && config.safetyMinModulePx !== 2)
    params.set('safeMinPx', config.safetyMinModulePx.toString());
  if (config.safetyMinQuietZone !== undefined && config.safetyMinQuietZone !== 4)
    params.set('safeMinQz', config.safetyMinQuietZone.toString());
  buildSafetyLockParams(config, params);
  buildSafetyIntensityParams(config, params);
}
