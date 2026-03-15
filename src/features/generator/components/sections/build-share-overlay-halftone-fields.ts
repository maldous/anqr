import type { StoreState } from './share-config-store-state.type';

export function buildShareOverlayHalftoneFields(overlay: StoreState['overlay']) {
  const isHalftone = overlay.mode === 'halftone';
  return {
    halftoneCell:
      isHalftone && overlay.halftoneCell !== 'per_module' ? overlay.halftoneCell : undefined,
    halftoneDotShape:
      isHalftone && overlay.halftoneDotShape !== 'circle' ? overlay.halftoneDotShape : undefined,
    brightnessCurve:
      isHalftone && overlay.brightnessCurve !== 'linear' ? overlay.brightnessCurve : undefined,
  };
}
