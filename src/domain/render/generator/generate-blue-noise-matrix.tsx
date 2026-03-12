import type { CanvasFactory } from '../../../platform/browser/canvas/canvas-factory';
import type {
  CreateCanvasFn,
  PixelDecisionMatrix,
  QRCodeInstance,
  QRGeneratorConfig,
} from '../../../modules/qr-generator/types';
import { bitsToMatrix } from './bits-to-matrix';
import { BlueNoisePixelCtx } from './blue-noise-pixel-ctx';
import { buildStrictConstraintConfig } from './build-strict-constraint-config';
import { clamp01 } from './clamp01';
import { createEmptyMatrix } from './create-empty-matrix';
import { enforceModuleConstraints } from './enforce-module-constraints';
import { generateBWFirstMatrix } from './generate-bw-first-matrix';
import { getBlueNoiseTileCached } from './get-blue-noise-tile-cached';
import { log } from './log';
import { packedColorsToMatrix } from './packed-colors-to-matrix';
import { processBlueNoisePixel } from './process-blue-noise-pixel';
import { readOverlayPixelsAtSize } from './read-overlay-pixels-at-size';
import { removeIsolatedSpeckles } from './remove-isolated-speckles';

/**
 * Generate blue noise pixel matrix
 * Uses a blue noise threshold field over the same desired-darkness model.
 */
export async function generateBlueNoiseMatrix(
  qr: QRCodeInstance,
  config: QRGeneratorConfig,
  overlayCanvas: HTMLCanvasElement | OffscreenCanvas,
  moduleCount: number,
  scale: number,
  effectiveIntensity: number,
  _canvasFactory: CanvasFactory,
  createCanvasFn: CreateCanvasFn,
  releaseCanvasFn?: (canvas: HTMLCanvasElement | OffscreenCanvas) => void
): Promise<PixelDecisionMatrix> {
  const scaledSize = moduleCount * scale;

  // QR-FIRST MODE: for high-contrast B&W images, guarantee scannability
  if (config.qrFirstMode) {
    log.debug('QR-first mode enabled via config in blue-noise mode - using QR-first matrix');
    return generateBWFirstMatrix(
      qr,
      config,
      overlayCanvas,
      moduleCount,
      scale,
      effectiveIntensity,
      createCanvasFn,
      releaseCanvasFn
    );
  }

  const rawIntensity = effectiveIntensity;
  const intensity = clamp01(rawIntensity);
  const version = config.typeNumber || Math.ceil((moduleCount - 17) / 4);

  const data = await readOverlayPixelsAtSize(
    overlayCanvas,
    scaledSize,
    createCanvasFn,
    releaseCanvasFn
  );
  if (!data) {
    return createEmptyMatrix(scaledSize, scale, effectiveIntensity);
  }

  const pixelCount = scaledSize * scaledSize;
  const matrixBits = new Uint8Array(pixelCount);
  const packedColors = new Uint32Array(pixelCount);
  const desire = new Float32Array(pixelCount);
  desire.fill(0.5);

  const seed = config.blueNoiseSeed ?? config.seed ?? 1337;
  const tileSize = config.blueNoiseTileSize ?? 64;
  const tile = getBlueNoiseTileCached(tileSize, seed);
  const qrBitBiasStrength = clamp01(config.qrBitBiasStrength ?? 0);
  const scanGateProfile = config.scanGateProfile ?? 'full';
  const scanGateActive = scanGateProfile !== 'off';
  const scanGateBiasBoost = scanGateActive ? 0.06 + intensity * 0.04 : 0;
  const minPolarityBias = 0.08 + intensity * 0.08;
  const effectiveBitBias = Math.max(
    qrBitBiasStrength + scanGateBiasBoost,
    minPolarityBias + scanGateBiasBoost * 0.4
  );

  const bnCtx: BlueNoisePixelCtx = {
    qr,
    config,
    data,
    scaledSize,
    scale,
    version,
    moduleCount,
    intensity,
    effectiveBitBias,
    scanGateActive,
    tile,
    tileSize,
  };

  for (let y = 0; y < scaledSize; y++) {
    for (let x = 0; x < scaledSize; x++) {
      processBlueNoisePixel(bnCtx, x, y, matrixBits, packedColors, desire);
    }
  }

  const strictConstraintConfig = buildStrictConstraintConfig(config, scanGateActive, intensity);
  enforceModuleConstraints(
    qr,
    matrixBits,
    desire,
    moduleCount,
    scale,
    scaledSize,
    version,
    strictConstraintConfig
  );
  if (config.cleanupSpeckle === true) {
    removeIsolatedSpeckles(qr, matrixBits, scaledSize, moduleCount, scale, version, config);
  }

  log.debug('blue-noise-matrix generated', {
    scaledSize,
    moduleCount,
    scale,
    rawIntensity,
    effectiveIntensityForFrame: intensity,
    tileSize,
    seed,
  });

  return {
    matrix: bitsToMatrix(matrixBits, scaledSize),
    colors: packedColorsToMatrix(packedColors, scaledSize),
    scale,
    overlayData: null,
    effectiveIntensity,
  };
}
