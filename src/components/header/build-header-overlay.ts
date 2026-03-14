import type { StoreState } from './store-state.type';

export function buildHeaderOverlay(overlay: StoreState['overlay']) {
  if (!overlay.enabled) return {};
  return {
    mode: overlay.mode,
    intensity: overlay.intensity === 100 ? undefined : overlay.intensity,
    overlayUrl: overlay.url || undefined,
    fit: overlay.fit === 'cover' ? undefined : overlay.fit,
    rotate: overlay.rotateDeg === 0 ? undefined : overlay.rotateDeg,
    flipX: overlay.flipX ? true : undefined,
    flipY: overlay.flipY ? true : undefined,
    preserveFinders: !overlay.preserveFinders ? false : undefined,
    preserveTiming: overlay.preserveTiming ? true : undefined,
    preserveAlignment: overlay.preserveAlignment ? true : undefined,
    protectFormatInfo: overlay.protectFormatInfo ? true : undefined,
    protectVersionInfo: overlay.protectVersionInfo ? true : undefined,
    eccAwareEnabled: overlay.eccAwareEnabled ? true : undefined,
    eccAwareRiskBudget:
      !overlay.eccAwareEnabled || overlay.eccAwareRiskBudget === 50
        ? undefined
        : overlay.eccAwareRiskBudget,
    eccAwareWeightMap:
      !overlay.eccAwareEnabled || overlay.eccAwareWeightMap === 'distance_to_finders'
        ? undefined
        : overlay.eccAwareWeightMap,
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
    blendPreservations: overlay.blendPreservations !== true ? undefined : true,
    blendPreservationMode:
      overlay.blendPreservations !== true || overlay.blendPreservationMode === 'overlay'
        ? undefined
        : overlay.blendPreservationMode,
    ditherSerpentine: overlay.ditherSerpentine ? true : undefined,
    orderedMatrix: overlay.orderedMatrix === 'bayer4' ? undefined : overlay.orderedMatrix,
    blueNoiseTileSize: overlay.blueNoiseTileSize === 64 ? undefined : overlay.blueNoiseTileSize,
    blueNoiseSeed: overlay.blueNoiseSeed === 0 ? undefined : overlay.blueNoiseSeed,
    colorDither: overlay.colorDither === 'none' ? undefined : overlay.colorDither,
    subpixelGridSize:
      overlay.mode !== 'subpixel' || overlay.subpixelGridSize === '3x3'
        ? undefined
        : overlay.subpixelGridSize,
    subpixelCenterRule:
      overlay.mode !== 'subpixel' || overlay.subpixelCenterRule === 'strict'
        ? undefined
        : overlay.subpixelCenterRule,
    subpixelNeutralColor:
      overlay.mode !== 'subpixel' || overlay.subpixelNeutralColor === '#808080'
        ? undefined
        : overlay.subpixelNeutralColor,
    subpixelFinderOverride:
      overlay.mode !== 'subpixel' || overlay.subpixelFinderOverride === 'solid'
        ? undefined
        : overlay.subpixelFinderOverride,
    halftoneCell:
      overlay.mode !== 'halftone' || overlay.halftoneCell === 'per_module'
        ? undefined
        : overlay.halftoneCell,
    halftoneDotShape:
      overlay.mode !== 'halftone' || overlay.halftoneDotShape === 'circle'
        ? undefined
        : overlay.halftoneDotShape,
    brightnessCurve:
      overlay.mode !== 'halftone' || overlay.brightnessCurve === 'linear'
        ? undefined
        : overlay.brightnessCurve,
    duotoneColor1:
      overlay.mode !== 'duotone' || overlay.duotoneColors[0] === '#000000'
        ? undefined
        : overlay.duotoneColors[0],
    duotoneColor2:
      overlay.mode !== 'duotone' || overlay.duotoneColors[1] === '#ffffff'
        ? undefined
        : overlay.duotoneColors[1],
  };
}
