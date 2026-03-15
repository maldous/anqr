import type { ShareConfig } from './types';

export function buildRenderAdvancedParams(
  config: Partial<ShareConfig>,
  params: URLSearchParams
): void {
  if (config.dotRotation !== undefined && config.dotRotation !== 0)
    params.set('dotRot', config.dotRotation.toString());
  if (config.crispEdges === false) params.set('crisp', '0');
  if (config.pixelSnap && config.pixelSnap !== 'floor') params.set('snap', config.pixelSnap);
  if (config.perModuleColorMode && config.perModuleColorMode !== 'solid')
    params.set('modColor', config.perModuleColorMode);
  if (config.contrastGuard) params.set('cGuard', '1');
  if (config.minContrastRatio !== undefined && config.minContrastRatio !== 4.5)
    params.set('minContrast', config.minContrastRatio.toString());
  if (config.subpixelMode) params.set('subpixel', '1');
  if (config.subpixelGrid !== undefined && config.subpixelGrid !== 3)
    params.set('spGridNum', config.subpixelGrid.toString());
}
