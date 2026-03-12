import type { ShareConfig } from './types';
import { buildOverlayImageSourceParams } from './build-overlay-image-source-params';
import { buildOverlayCropParams } from './build-overlay-crop-params';
import { buildOverlayGifParams } from './build-overlay-gif-params';

export function buildOverlayImageParams(
  config: Partial<ShareConfig>,
  params: URLSearchParams
): void {
  buildOverlayImageSourceParams(config, params);
  buildOverlayCropParams(config, params);
  buildOverlayGifParams(config, params);
}
