import type {
  CreateCanvasFn,
  PixelDecisionMatrix,
  QRCodeInstance,
  QRGeneratorConfig,
} from '../../../modules/qr-generator/types';
import { bitsToMatrix } from './bits-to-matrix';
import { buildDitherResolvedConfig } from './build-dither-resolved-config';
import { computeDitherThreshold } from './compute-dither-threshold';
import { computeQualityMetrics } from './compute-quality-metrics';
import { enforceModuleConstraints } from './enforce-module-constraints';
import type { ErrorDiffusionPixelCtx } from './error-diffusion-pixel-ctx';
import { log } from './log';
import { packedColorsToMatrix } from './packed-colors-to-matrix';
import { pixelIndex } from './pixel-index';
import { processErrorDiffusionPixel } from './process-error-diffusion-pixel';
import { removeIsolatedSpeckles } from './remove-isolated-speckles';
import { resolvePreparedMatrixInput } from './resolve-prepared-matrix-input';
import { serpentineRowParams } from './serpentine-row-params';

/**
 * Generate dithered pixel matrix
 * Uses error-diffusion over a "desired darkness" field.
 */
export async function generateDitheredMatrix(
  qr: QRCodeInstance,
  config: QRGeneratorConfig,
  overlayCanvas: HTMLCanvasElement | OffscreenCanvas,
  moduleCount: number,
  scale: number,
  effectiveIntensity: number,
  _effectiveConfig: QRGeneratorConfig,
  createCanvasFn: CreateCanvasFn,
  releaseCanvasFn?: (canvas: HTMLCanvasElement | OffscreenCanvas) => void
): Promise<PixelDecisionMatrix> {
  const prepared = await resolvePreparedMatrixInput({
    config,
    createCanvasFn,
    effectiveIntensity,
    modeLabel: 'dithered',
    moduleCount,
    overlayCanvas,
    qr,
    releaseCanvasFn,
    scale,
  });
  if (prepared.matrix) {
    return prepared.matrix;
  }
  const { data, matrixBits, packedColors, pixelCount, scaledSize } = prepared.matrixInput;

  const dc = buildDitherResolvedConfig(config, moduleCount, effectiveIntensity, scaledSize);
  const desire = new Float32Array(pixelCount);
  const errors = new Float32Array(pixelCount);
  desire.fill(0.5);

  const sampleThreshold = (x: number, y: number, sampleIdx: number, overlayDark: number): number =>
    computeDitherThreshold(
      x,
      y,
      sampleIdx,
      overlayDark,
      dc.mix,
      dc.thresholdPattern,
      dc.staticState,
      dc.noiseTile,
      dc.tileSize,
      dc.temporalOffsetX,
      dc.temporalOffsetY
    );

  const edCtx: ErrorDiffusionPixelCtx = {
    qr,
    config,
    data,
    scaledSize,
    scale,
    version: dc.version,
    moduleCount,
    mix: dc.mix,
    thresholdOnly: dc.thresholdOnly,
    useColorDither: dc.useColorDither,
    qrBitBiasStrength: dc.qrBitBiasStrength,
    kernel: dc.staticState.kernel,
    sampleThreshold,
  };

  for (let y = 0; y < scaledSize; y++) {
    const rp = serpentineRowParams(y, scaledSize, dc.serpentine);

    for (let x = rp.startX; rp.leftToRight ? x < rp.endX : x > rp.endX; x += rp.deltaX) {
      processErrorDiffusionPixel(
        edCtx,
        x,
        y,
        rp.leftToRight,
        matrixBits,
        packedColors,
        desire,
        errors
      );
    }
  }

  enforceModuleConstraints(
    qr,
    matrixBits,
    desire,
    moduleCount,
    scale,
    scaledSize,
    dc.version,
    config
  );
  if (config.cleanupSpeckle === true) {
    removeIsolatedSpeckles(qr, matrixBits, scaledSize, moduleCount, scale, dc.version, config);
  }

  const center = Math.floor(scale / 2);
  const sampleMr = Math.min(10, moduleCount - 1);
  const sampleMc = Math.min(10, moduleCount - 1);
  const sy = sampleMr * scale + center;
  const sx = sampleMc * scale + center;
  log.debug('dithered-matrix generated', {
    scaledSize,
    moduleCount,
    scale,
    rawIntensity: effectiveIntensity,
    effectiveIntensityForFrame: dc.intensity,
    mix: dc.mix,
    serpentine: dc.serpentine,
    ditherKind: dc.ditherKind,
    thresholdPattern: dc.thresholdPattern,
    thresholdOnly: dc.thresholdOnly,
    colorDitherMode: dc.colorDitherMode,
    kernelName: dc.kernelName,
    sample: {
      module: { row: sampleMr, col: sampleMc, qrIsDark: qr.isDark(sampleMr, sampleMc) },
      centerPixel: {
        y: sy,
        x: sx,
        isDark: matrixBits[pixelIndex(sx, sy, scaledSize)] === 1,
        desire: desire[pixelIndex(sx, sy, scaledSize)],
      },
    },
    quality: computeQualityMetrics(matrixBits, desire, scaledSize, scale),
  });

  return {
    matrix: bitsToMatrix(matrixBits, scaledSize),
    colors: packedColorsToMatrix(packedColors, scaledSize),
    scale,
    overlayData: null,
    effectiveIntensity,
  };
}
