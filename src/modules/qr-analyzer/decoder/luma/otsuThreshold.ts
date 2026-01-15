import {for, imageData, s, threshold, variance} from '../shared';
import { buildLumaBuffer } from '../luma/buildLumaBuffer';
import { otsuThresholdFromLuma } from '../luma/otsuThresholdFromLuma';
/**
 * Otsu's thresholding method for optimal binarization
 * Automatically finds the threshold that minimizes intra-class variance
 * 
 * For bimodal images (e.g., pure black and white QR codes), Otsu might return
 * extreme values like 0 or 255. In these cases, we fall back to finding the
 * midpoint between the two peaks.
 */
export function otsuThreshold(imageData: ImageData): number {
  const luma = buildLumaBuffer(imageData);
  return otsuThresholdFromLuma(luma);
}

