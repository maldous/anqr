/**
 * QR-Art Image Utilities
 *
 * Utilities for mapping target images to QR module values.
 * Extracted to its own file to avoid circular imports.
 */

/**
 * Map an image to target pixel values with supersampling for better accuracy
 */
export interface MapImageToTargetsOptions {
  supersampleLevel?: 1 | 2;
}

export function mapImageToTargetsSupersampled(
  image: ImageData | HTMLCanvasElement | OffscreenCanvas,
  moduleCount: number,
  threshold: number = 128,
  options?: MapImageToTargetsOptions
): { targets: boolean[][]; importance: number[][] } {
  const isCanvasLike = (value: unknown): value is HTMLCanvasElement | OffscreenCanvas =>
    !!value &&
    typeof (value as { getContext?: unknown }).getContext === 'function' &&
    typeof (value as { width?: unknown }).width === 'number' &&
    typeof (value as { height?: unknown }).height === 'number';

  const isImageDataLike = (
    value: unknown
  ): value is { width: number; height: number; data: Uint8ClampedArray | ArrayLike<number> } => {
    if (!value) return false;
    const candidate = value as {
      width?: unknown;
      height?: unknown;
      data?: unknown;
    };
    if (typeof candidate.width !== 'number' || typeof candidate.height !== 'number') return false;

    // Canvas implementations can expose a `data()` method. Only accept actual array-like pixel data.
    if (candidate.data == null || typeof candidate.data === 'function') return false;

    const data = candidate.data as { length?: unknown };
    if (typeof data.length !== 'number') return false;
    if (data.length < candidate.width * candidate.height * 4) return false;
    return true;
  };

  // Get image data
  let imageData: ImageData;
  if (typeof ImageData !== 'undefined' && image instanceof ImageData) {
    imageData = image;
  } else if (isCanvasLike(image)) {
    const ctx = image.getContext('2d') as
      | CanvasRenderingContext2D
      | OffscreenCanvasRenderingContext2D
      | null;
    if (!ctx) {
      // Return empty targets if we can't get context
      return {
        targets: Array.from({ length: moduleCount }, () => Array(moduleCount).fill(false)),
        importance: Array.from({ length: moduleCount }, () => Array(moduleCount).fill(0)),
      };
    }
    imageData = ctx.getImageData(0, 0, image.width, image.height);
  } else if (isImageDataLike(image)) {
    // Accept ImageData-like objects (e.g., Node test fixtures)
    const candidate = image;
    const data = candidate.data;
    imageData = {
      data:
        data instanceof Uint8ClampedArray ? data : new Uint8ClampedArray(data as ArrayLike<number>),
      width: candidate.width,
      height: candidate.height,
    } as ImageData;
  } else {
    // Return empty targets if input is neither canvas-like nor imageData-like.
    return {
      targets: Array.from({ length: moduleCount }, () => Array(moduleCount).fill(false)),
      importance: Array.from({ length: moduleCount }, () => Array(moduleCount).fill(0)),
    };
  }

  const targets: boolean[][] = [];
  const importance: number[][] = [];

  const scaleX = imageData.width / moduleCount;
  const scaleY = imageData.height / moduleCount;
  const maxX = Math.max(0, imageData.width - 1);
  const maxY = Math.max(0, imageData.height - 1);

  const supersampleLevel = options?.supersampleLevel === 1 ? 1 : 2;
  const samplePoints =
    supersampleLevel === 1
      ? [{ dx: 0.5, dy: 0.5 }]
      : [
          { dx: 0.25, dy: 0.25 },
          { dx: 0.75, dy: 0.25 },
          { dx: 0.25, dy: 0.75 },
          { dx: 0.75, dy: 0.75 },
        ];

  for (let row = 0; row < moduleCount; row++) {
    targets[row] = [];
    importance[row] = [];

    for (let col = 0; col < moduleCount; col++) {
      let totalGray = 0;
      let minGray = 255;
      let maxGray = 0;

      // Sample multiple points within the module
      for (const { dx, dy } of samplePoints) {
        const imgX = Math.max(0, Math.min(maxX, Math.floor((col + dx) * scaleX)));
        const imgY = Math.max(0, Math.min(maxY, Math.floor((row + dy) * scaleY)));
        const idx = (imgY * imageData.width + imgX) * 4;

        const rawGray =
          (imageData.data[idx] + imageData.data[idx + 1] + imageData.data[idx + 2]) / 3;
        const gray = Number.isFinite(rawGray) ? rawGray : 255;
        totalGray += gray;
        minGray = Math.min(minGray, gray);
        maxGray = Math.max(maxGray, gray);
      }

      const avgGray = totalGray / samplePoints.length;
      const contrast = maxGray - minGray;

      // Target is dark if average gray is below threshold
      targets[row][col] = avgGray < threshold;

      // Importance based on distance from threshold and local contrast
      // High contrast areas and areas far from threshold are more important
      const distanceFromThreshold = Math.abs(avgGray - threshold) / 128;
      const contrastBoost = Math.min(1, contrast / 100);
      importance[row][col] = Math.min(1, distanceFromThreshold + contrastBoost * 0.3);
    }
  }

  return { targets, importance };
}
