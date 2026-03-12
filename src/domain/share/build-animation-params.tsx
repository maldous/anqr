import type { ShareConfig } from './types';
import { buildAnimationPatternParams } from './build-animation-pattern-params';
import { buildAnimationFrameParams } from './build-animation-frame-params';

export function buildAnimationParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.speed !== undefined && config.speed !== 100)
    params.set('speed', config.speed.toString());
  if (config.loop === false) params.set('loop', '0');
  if (config.reverse) params.set('reverse', '1');
  if (config.bounce) params.set('bounce', '1');
  buildAnimationFrameParams(config, params);
  buildAnimationPatternParams(config, params);
}
