import type { ShareConfig } from './types';

export function buildOverlayGifParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.gifUseFrameDelays === false) params.set('gifDelays', '0');
  if (config.gifMaxFps !== undefined && config.gifMaxFps !== 30)
    params.set('gifMaxFps', config.gifMaxFps.toString());
  if (config.gifDisposalHandling && config.gifDisposalHandling !== 'respect')
    params.set('gifDispH', config.gifDisposalHandling);
}
