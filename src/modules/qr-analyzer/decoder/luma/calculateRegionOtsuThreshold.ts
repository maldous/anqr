import {QRLocation, col, for, imageData, location, row, threshold, transform, x, y} from '../shared';
import { otsuThreshold } from '../luma/otsuThreshold';
// ============================================
// PERSPECTIVE TRANSFORM
// ============================================

// ============================================
// MODULE MATRIX EXTRACTION
// ============================================

/**
 * Calculate Otsu threshold for pixels within the QR region
 * Includes bimodal image handling like the global otsuThreshold function
 */
export function calculateRegionOtsuThreshold(
  imageData: ImageData,
  location: QRLocation,
  transform: (col: number, row: number) => { x: number; y: number }

