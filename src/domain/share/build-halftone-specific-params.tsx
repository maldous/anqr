import type { ShareConfig } from './types';

export function buildHalftoneSpecificParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.halftoneCell && config.halftoneCell !== 'per_module')
    params.set('htCell', config.halftoneCell);
  if (config.halftoneDotShape && config.halftoneDotShape !== 'circle')
    params.set('htDot', config.halftoneDotShape);
  if (config.brightnessCurve && config.brightnessCurve !== 'linear')
    params.set('htCurve', config.brightnessCurve);
  if (config.duotoneColor1 && config.duotoneColor1 !== '#000000')
    params.set('duo1', config.duotoneColor1.replace('#', ''));
  if (config.duotoneColor2 && config.duotoneColor2 !== '#ffffff')
    params.set('duo2', config.duotoneColor2.replace('#', ''));
}
