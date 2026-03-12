import type { ShareConfig } from './types';
import { buildQREncodingParams } from './build-qr-encoding-params';

export function buildQRSettingsParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.ec && config.ec !== 'H') params.set('ec', config.ec);
  if (config.version && config.version !== 0) params.set('v', config.version.toString());
  if (config.size && config.size !== 20) params.set('size', config.size.toString());
  if (config.margin !== undefined && config.margin !== 4)
    params.set('margin', config.margin.toString());
  buildQREncodingParams(config, params);
}
