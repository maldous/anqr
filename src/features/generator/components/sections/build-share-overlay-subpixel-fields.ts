import type { StoreState } from './share-config-store-state.type';

export function buildShareOverlaySubpixelFields(overlay: StoreState['overlay']) {
  const isSubpixel = overlay.mode === 'subpixel';
  return {
    subpixelGridSize:
      isSubpixel && overlay.subpixelGridSize !== '3x3' ? overlay.subpixelGridSize : undefined,
    subpixelCenterRule:
      isSubpixel && overlay.subpixelCenterRule !== 'strict'
        ? overlay.subpixelCenterRule
        : undefined,
    subpixelNeutralColor:
      isSubpixel && overlay.subpixelNeutralColor !== '#808080'
        ? overlay.subpixelNeutralColor
        : undefined,
    subpixelFinderOverride:
      isSubpixel && overlay.subpixelFinderOverride !== 'solid'
        ? overlay.subpixelFinderOverride
        : undefined,
  };
}
