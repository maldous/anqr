import type { ShareConfig } from './types';

export function buildOverlayCropParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.cropEnabled) params.set('cropEn', '1');
  if (config.cropX !== undefined && config.cropX !== 0.5)
    params.set('cropX', config.cropX.toString());
  if (config.cropY !== undefined && config.cropY !== 0.5)
    params.set('cropY', config.cropY.toString());
  if (config.cropSize !== undefined && config.cropSize !== 1)
    params.set('cropSize', config.cropSize.toString());
}
