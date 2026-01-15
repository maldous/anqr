import {QRLocation, adequate, bottom, code, imageData, left, location, right, top} from '../shared';
// ============================================
// QUIET ZONE ESTIMATION
// ============================================

/**
 * Estimate the quiet zone (white border) around the QR code
 */
export function estimateQuietZone(
  imageData: ImageData,
  location: QRLocation,
  moduleCount: number
): {
  top: number;
  right: number;
  bottom: number;
  left: number;
  adequate: boolean;
}

