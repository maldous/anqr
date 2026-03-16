import type { QRGeneratorConfig } from "./types";

export function buildFixedVisualPolicy(config: QRGeneratorConfig): Partial<QRGeneratorConfig> {
  return {
    overlayMode: config.overlayMode,
    colorMode: config.colorMode,
    renderScalePerModule: config.renderScalePerModule,
    ditherKind: config.ditherKind,
    ditherMode: config.ditherMode,
    ditherStrength: config.ditherStrength,
    finderDitherStrength: config.finderDitherStrength,
    blendPreservations: config.blendPreservations,
    blendPreservationMode: config.blendPreservationMode,
    ditherScale: config.ditherScale,
    ditherSerpentine: config.ditherSerpentine,
    diffusionKernel: config.diffusionKernel,
    orderedMatrix: config.orderedMatrix,
    blueNoiseTileSize: config.blueNoiseTileSize,
    blueNoiseSeed: config.blueNoiseSeed,
    colorDither: config.colorDither,
    dotMinRadiusPx: config.dotMinRadiusPx,
    dotMaxRadiusPx: config.dotMaxRadiusPx,
    seed: config.seed,
  };
}
