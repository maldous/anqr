import type { ImageProperties } from './analyzer-content.types';

/**
 * Calculate image properties from ImageData
 */
export function calculateImageProperties(imageData: ImageData): ImageProperties {
  const { width, height } = imageData;
  return {
    width,
    height,
    aspectRatio: Math.round((width / height) * 100) / 100,
    estimatedQrSizePx: Math.min(width, height),
  };
}
