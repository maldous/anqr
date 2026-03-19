/**
 * QR Generator Standard Pixel Matrix
 * Standard overlay mode pixel matrix generation
 */

import { createLogger } from "../../../../observability/logging/src";
import { getOverlayData } from "../overlay/overlay-data";
import { normalizeColors } from "./pixel-matrix-dither";
import type {
  CreateCanvasFn,
  PixelDecisionMatrix,
  QRCodeObject,
  QRGeneratorConfig,
} from "@/domain/render/qr-generator-shared";

const _log = createLogger("GENERATE");

/**
 * Generate standard mode pixel matrix
 */
export async function generateStandardMatrix(
  qr: QRCodeObject,
  _config: QRGeneratorConfig,
  overlayCanvas: HTMLCanvasElement | OffscreenCanvas,
  moduleCount: number,
  effectiveIntensity: number,
  effectiveConfig: QRGeneratorConfig,
  createCanvasFn: CreateCanvasFn,
): Promise<PixelDecisionMatrix> {
  // Get overlay data
  const overlayData = await getOverlayData(
    overlayCanvas,
    moduleCount,
    effectiveConfig,
    createCanvasFn,
  );

  // Generate matrix from QR data
  const matrix: boolean[][] = [];
  for (let row = 0; row < moduleCount; row++) {
    matrix[row] = [];
    for (let col = 0; col < moduleCount; col++) {
      matrix[row][col] = qr.isDark(row, col);
    }
  }

  // Normalize colors
  const colors = normalizeColors(overlayData, moduleCount);

  return {
    matrix,
    colors,
    scale: 1,
    overlayData,
    effectiveIntensity,
  };
}
