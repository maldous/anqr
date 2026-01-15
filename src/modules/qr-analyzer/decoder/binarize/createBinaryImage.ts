import {dark, imageData, threshold} from '../shared';
import { buildLumaBuffer } from '../luma/buildLumaBuffer';
import { createBinaryFromLuma } from '../binarize/createBinaryFromLuma';
/**
 * Create a binary image from ImageData using a threshold
 * Returns array where true = dark pixel
 */
export function createBinaryImage(imageData: ImageData, threshold: number): boolean[] {
  const luma = buildLumaBuffer(imageData);
  return createBinaryFromLuma(luma, threshold);
}

