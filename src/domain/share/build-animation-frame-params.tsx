import type { ShareConfig } from './types';

export function buildAnimationFrameParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.startFrame !== undefined && config.startFrame !== 0)
    params.set('startF', config.startFrame.toString());
  if (config.maxFrames !== undefined && config.maxFrames !== 0)
    params.set('maxF', config.maxFrames.toString());
  if (config.frameStep !== undefined && config.frameStep !== 1)
    params.set('stepF', config.frameStep.toString());
  if (config.interpolate && config.interpolate !== 'none') params.set('interp', config.interpolate);
  if (config.temporalDither && config.temporalDither !== 'off')
    params.set('tempDither', config.temporalDither);
}
