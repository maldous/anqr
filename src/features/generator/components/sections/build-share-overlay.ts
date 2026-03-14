import type { StoreState } from './share-config-store-state.type';

export function buildShareOverlay(overlay: StoreState['overlay']) {
  if (!overlay.enabled) return {};
  return {
    mode: overlay.mode,
    intensity: overlay.intensity === 100 ? undefined : overlay.intensity,
    overlayUrl: overlay.url || undefined,
    fit: overlay.fit === 'cover' ? undefined : overlay.fit,
    rotate: overlay.rotateDeg === 0 ? undefined : overlay.rotateDeg,
    flipX: overlay.flipX ? true : undefined,
    flipY: overlay.flipY ? true : undefined,
    preserveFinders: overlay.preserveFinders ? undefined : false,
    preserveTiming: overlay.preserveTiming ? true : undefined,
    preserveAlignment: overlay.preserveAlignment ? true : undefined,
    protectFormatInfo: overlay.protectFormatInfo ? true : undefined,
    protectVersionInfo: overlay.protectVersionInfo ? true : undefined,
    eccAwareEnabled: overlay.eccAwareEnabled ? true : undefined,
    eccAwareRiskBudget:
      overlay.eccAwareEnabled && overlay.eccAwareRiskBudget !== 50
        ? overlay.eccAwareRiskBudget
        : undefined,
    eccAwareWeightMap:
      overlay.eccAwareEnabled && overlay.eccAwareWeightMap !== 'distance_to_finders'
        ? overlay.eccAwareWeightMap
        : undefined,
    colorMode: overlay.colorMode === 'color' ? undefined : overlay.colorMode,
    brightness: overlay.brightness === 0 ? undefined : overlay.brightness,
    contrast: overlay.contrast === 0 ? undefined : overlay.contrast,
    gamma: overlay.gamma === 1 ? undefined : overlay.gamma,
    saturation: overlay.saturation === 0 ? undefined : overlay.saturation,
    hue: overlay.hueRotateDeg === 0 ? undefined : overlay.hueRotateDeg,
    blur: overlay.blurPx === 0 ? undefined : overlay.blurPx,
    sharpen: overlay.sharpen === 0 ? undefined : overlay.sharpen,
    posterize: overlay.posterizeLevels === 0 ? undefined : overlay.posterizeLevels,
    threshold: overlay.threshold === 128 ? undefined : overlay.threshold,
    edge: overlay.edgeDetect === 'off' ? undefined : overlay.edgeDetect,
    invert: overlay.invert || undefined,
    ditherKind: overlay.ditherKind === 'error_diffusion' ? undefined : overlay.ditherKind,
    diffusionKernel:
      overlay.diffusionKernel === 'floyd_steinberg' ? undefined : overlay.diffusionKernel,
    ditherStrength: overlay.ditherStrength === 50 ? undefined : overlay.ditherStrength,
    finderDitherStrength:
      overlay.finderDitherStrength === 65 ? undefined : overlay.finderDitherStrength,
    blendPreservations: overlay.blendPreservations ? true : undefined,
    blendPreservationMode:
      overlay.blendPreservations && overlay.blendPreservationMode !== 'overlay'
        ? overlay.blendPreservationMode
        : undefined,
    ditherSerpentine: overlay.ditherSerpentine ? true : undefined,
    orderedMatrix: overlay.orderedMatrix === 'bayer4' ? undefined : overlay.orderedMatrix,
    blueNoiseTileSize: overlay.blueNoiseTileSize === 64 ? undefined : overlay.blueNoiseTileSize,
    blueNoiseSeed: overlay.blueNoiseSeed === 0 ? undefined : overlay.blueNoiseSeed,
    colorDither: overlay.colorDither === 'none' ? undefined : overlay.colorDither,
    subpixelGridSize:
      overlay.mode === 'subpixel' && overlay.subpixelGridSize !== '3x3'
        ? overlay.subpixelGridSize
        : undefined,
    subpixelCenterRule:
      overlay.mode === 'subpixel' && overlay.subpixelCenterRule !== 'strict'
        ? overlay.subpixelCenterRule
        : undefined,
    subpixelNeutralColor:
      overlay.mode === 'subpixel' && overlay.subpixelNeutralColor !== '#808080'
        ? overlay.subpixelNeutralColor
        : undefined,
    subpixelFinderOverride:
      overlay.mode === 'subpixel' && overlay.subpixelFinderOverride !== 'solid'
        ? overlay.subpixelFinderOverride
        : undefined,
    halftoneCell:
      overlay.mode === 'halftone' && overlay.halftoneCell !== 'per_module'
        ? overlay.halftoneCell
        : undefined,
    halftoneDotShape:
      overlay.mode === 'halftone' && overlay.halftoneDotShape !== 'circle'
        ? overlay.halftoneDotShape
        : undefined,
    brightnessCurve:
      overlay.mode === 'halftone' && overlay.brightnessCurve !== 'linear'
        ? overlay.brightnessCurve
        : undefined,
    duotoneColor1:
      overlay.mode === 'duotone' && overlay.duotoneColors[0] !== '#000000'
        ? overlay.duotoneColors[0]
        : undefined,
    duotoneColor2:
      overlay.mode === 'duotone' && overlay.duotoneColors[1] !== '#ffffff'
        ? overlay.duotoneColors[1]
        : undefined,
  };
}
