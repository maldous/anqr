import { applyDitherToMatrix } from "../dither/dithering-matrix";
import { getOverlayData } from "../overlay/overlay-data";
import type {
  CreateCanvasFn,
  PixelDecisionMatrix,
  QRCodeObject,
  QRGeneratorConfig,
} from "@/domain/render/qr-generator-shared";
import { normalizeColors } from "./normalize-colors";

/**
 * Generate dither mode pixel matrix
 */
export async function generateDitherModeMatrix(
  qr: QRCodeObject,
  _config: QRGeneratorConfig,
  overlayCanvas: HTMLCanvasElement | OffscreenCanvas,
  moduleCount: number,
  effectiveIntensity: number,
  effectiveConfig: QRGeneratorConfig,
  _overlayMode: string,
  createCanvasFn: CreateCanvasFn,
): Promise<PixelDecisionMatrix> {
  // Get overlay data
  const overlayData = await getOverlayData(
    overlayCanvas,
    moduleCount,
    effectiveConfig,
    createCanvasFn,
  );

  // Apply dithering to create modified QR matrix
  const matrix = applyDitherToMatrix(qr, moduleCount, overlayData, effectiveConfig);

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
