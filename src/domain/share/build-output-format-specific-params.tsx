import type { ShareConfig } from './types';
import { buildGifFormatParams } from './build-gif-format-params';
import { buildSvgFormatParams } from './build-svg-format-params';
import { buildMiscFormatParams } from './build-misc-format-params';

export function buildOutputFormatSpecificParams(
  config: Partial<ShareConfig>,
  params: URLSearchParams
): void {
  buildGifFormatParams(config, params);
  buildSvgFormatParams(config, params);
  buildMiscFormatParams(config, params);
}
