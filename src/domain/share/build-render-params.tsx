import type { ShareConfig } from './types';
import { buildRenderGradientParams } from './build-render-gradient-params';
import { buildRenderEyeFrameParams } from './build-render-eye-frame-params';
import { buildRenderAdvancedParams } from './build-render-advanced-params';

export function buildRenderParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.moduleGap !== undefined && config.moduleGap !== 0)
    params.set('gap', config.moduleGap.toString());
  if (config.gapMode && config.gapMode !== 'none') params.set('gapMode', config.gapMode);
  if (config.cornerRadius !== undefined && config.cornerRadius !== 0)
    params.set('radius', config.cornerRadius.toString());
  buildRenderGradientParams(config, params);
  buildRenderEyeFrameParams(config, params);
  buildRenderAdvancedParams(config, params);
}
