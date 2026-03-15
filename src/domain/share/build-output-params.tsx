import type { ShareConfig } from './types';
import { buildOutputFormatSpecificParams } from './build-output-format-specific-params';
import { buildOutputQualityParams } from './build-output-quality-params';

export function buildOutputParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.width && config.width !== 400) params.set('w', config.width.toString());
  if (config.height && config.height !== 400) params.set('h', config.height.toString());
  if (config.format && config.format !== 'gif') params.set('format', config.format);
  buildOutputQualityParams(config, params);
  if (config.filename && config.filename !== 'anqr-qrcode') params.set('fname', config.filename);
  buildOutputFormatSpecificParams(config, params);
}
