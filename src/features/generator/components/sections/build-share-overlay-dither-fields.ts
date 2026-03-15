import type { StoreState } from './share-config-store-state.type';

export function buildShareOverlayDitherFields(overlay: StoreState['overlay']) {
  return {
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
  };
}
