import type { ShareConfig } from './types';

export function buildOverlayProtectionParams(
  config: Partial<ShareConfig>,
  params: URLSearchParams
): void {
  if (config.preserveFinders === false) params.set('keepFinders', '0');
  if (config.preserveTiming) params.set('keepTiming', '1');
  if (config.preserveAlignment) params.set('keepAlign', '1');
  if (config.protectFormatInfo) params.set('protectFmt', '1');
  if (config.protectVersionInfo) params.set('protectVer', '1');
  if (config.eccAwareEnabled) params.set('eccAware', '1');
  if (config.eccAwareRiskBudget !== undefined && config.eccAwareRiskBudget !== 50)
    params.set('eccRisk', config.eccAwareRiskBudget.toString());
  if (config.eccAwareWeightMap && config.eccAwareWeightMap !== 'distance_to_finders')
    params.set('eccMap', config.eccAwareWeightMap);
}
