import type { ShareConfig } from './types';

export function buildDitherNoiseParams(
  config: Partial<ShareConfig>,
  params: URLSearchParams
): void {
  if (config.orderedMatrix && config.orderedMatrix !== 'bayer4')
    params.set('matrix', config.orderedMatrix);
  if (config.blueNoiseTileSize !== undefined && config.blueNoiseTileSize !== 64)
    params.set('bnTile', config.blueNoiseTileSize.toString());
  if (config.blueNoiseSeed !== undefined && config.blueNoiseSeed !== 0)
    params.set('bnSeed', config.blueNoiseSeed.toString());
  if (config.colorDither && config.colorDither !== 'none')
    params.set('colorDither', config.colorDither);
}
