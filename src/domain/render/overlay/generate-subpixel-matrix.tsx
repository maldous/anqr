import type { QRCodeObject } from '../../../modules/qr-generator/cache';
import { curveIntensity } from '../generator/pixel-matrix-utils';
import type {
  CreateCanvasFn,
  PixelDecisionMatrix,
  QRGeneratorConfig,
  RGBWithMeta,
} from '../../../modules/qr-generator/types';
import { parseGridSize, parseHexColor, log, SubpixelCellCtx, processSubpixelCell } from './overlay-subpixel._internal';
import { getSubpixelOverlayData } from './get-subpixel-overlay-data';

/**
 * Generate subpixel matrix
 */
export async function generateSubpixelMatrix(
  qr: QRCodeObject,
  config: QRGeneratorConfig,
  overlayCanvas: HTMLCanvasElement | OffscreenCanvas,
  moduleCount: number,
  scale: number,
  useHalftoneCenter: boolean,
  createCanvasFn: CreateCanvasFn
): Promise<PixelDecisionMatrix> {
  const gridScale = parseGridSize(config.subpixelGridSize) || scale;
  const actualScale = gridScale;
  const scaledSize = moduleCount * actualScale;
  const intensity = curveIntensity(config.overlayIntensity ?? 100);

  const { brightness, colors } = await getSubpixelOverlayData(
    overlayCanvas,
    moduleCount,
    actualScale,
    config,
    createCanvasFn
  );

  const matrix: boolean[][] = [];
  const colorMatrix: (RGBWithMeta | null)[][] = [];

  const centerIdx = Math.floor(actualScale / 2);
  const neutralColor = parseHexColor(config.subpixelNeutralColor);
  const centerRule = config.subpixelCenterRule || 'strict';
  const useHalftone = centerRule === 'halftone_center' || useHalftoneCenter;
  const finderOverride = config.subpixelFinderOverride || 'solid';
  const version = config.typeNumber || Math.ceil((moduleCount - 17) / 4);

  log.debug('Subpixel matrix generation', {
    gridScale,
    actualScale,
    scaledSize,
    intensity,
    centerRule,
    finderOverride,
    hasNeutralColor: !!neutralColor,
  });

  const cellCtx: SubpixelCellCtx = {
    qr,
    config,
    brightness,
    colors,
    actualScale,
    centerIdx,
    neutralColor,
    useHalftone,
    finderOverride,
    moduleCount,
    version,
    intensity,
  };

  for (let y = 0; y < scaledSize; y++) {
    matrix[y] = [];
    colorMatrix[y] = [];

    for (let x = 0; x < scaledSize; x++) {
      processSubpixelCell(cellCtx, x, y, matrix, colorMatrix);
    }
  }

  return {
    matrix,
    colors: colorMatrix,
    scale: actualScale,
    overlayData: null,
    effectiveIntensity: intensity * 100,
  };
}
