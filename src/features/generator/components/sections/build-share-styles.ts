import type { StoreState } from './share-config-store-state.type';

export function buildShareStyles(render: StoreState['render']) {
  return {
    style: render.moduleStyle === 'square' ? undefined : render.moduleStyle,
    finder: render.finderStyle === 'square' ? undefined : render.finderStyle,
    alignmentStyle: render.alignmentStyle === 'match_finder' ? undefined : render.alignmentStyle,
    timingStyle: render.timingStyle === 'match_module' ? undefined : render.timingStyle,
    moduleGap: render.moduleGapPercent === 0 ? undefined : render.moduleGapPercent,
    gapMode: render.gapMode === 'none' ? undefined : render.gapMode,
    cornerRadius: render.cornerRadius === 0 ? undefined : render.cornerRadius,
    gradientType: render.gradient.type === 'none' ? undefined : render.gradient.type,
    eyeOuterStyle: render.eyeOuterStyle === 'square' ? undefined : render.eyeOuterStyle,
    eyeInnerStyle: render.eyeInnerStyle === 'square' ? undefined : render.eyeInnerStyle,
    eyeScale: render.eyeScale === 100 ? undefined : render.eyeScale,
    frameStyle: render.frameStyle === 'none' ? undefined : render.frameStyle,
    frameText: render.frameText || undefined,
    dotRotation: render.dotRotationDeg === 0 ? undefined : render.dotRotationDeg,
    crispEdges: render.crispEdges === false ? false : undefined,
    pixelSnap: render.pixelSnap === 'floor' ? undefined : render.pixelSnap,
    perModuleColorMode:
      render.perModuleColorMode === 'solid' ? undefined : render.perModuleColorMode,
    contrastGuard: render.contrastGuard ? true : undefined,
    minContrastRatio:
      render.contrastGuard && render.minContrastRatio !== 4.5 ? render.minContrastRatio : undefined,
  };
}
