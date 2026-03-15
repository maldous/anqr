import type { ShareConfig } from './types';

export function buildRenderGradientParams(
  config: Partial<ShareConfig>,
  params: URLSearchParams
): void {
  if (config.gradientType && config.gradientType !== 'none') {
    params.set('grad', config.gradientType);
    if (config.gradientStops && config.gradientStops.length > 0) {
      const stopsStr = config.gradientStops
        .map((s: { color: string; pos: number }) => `${s.color.replace('#', '')},${s.pos}`)
        .join(',');
      params.set('gradStops', stopsStr);
    }
    if (config.gradientAngle !== undefined && config.gradientAngle !== 0) {
      params.set('gradAngle', config.gradientAngle.toString());
    }
  }
}
