/**
 * QR-Art Image Utilities
 *
 * Utilities for mapping target images to QR module values.
 * Extracted to its own file to avoid circular imports.
 */

/**
 * Map an image to target pixel values with supersampling for better accuracy
 */
export function mapImageToTargetsSupersampled(
  image: ImageData | HTMLCanvasElement | OffscreenCanvas,
  moduleCount: number,
  threshold: number = 128
): { targets: boolean[][]; importance: number[][] } {
  // Get image data
  let imageData: ImageData;
  if (typeof ImageData !== 'undefined' && image instanceof ImageData) {
    imageData = image;
  } else if (
    image &&
    typeof (image as unknown as ImageData).width === 'number' &&
    typeof (image as unknown as ImageData).height === 'number' &&
    (image as unknown as ImageData).data != null
  ) {
    // Accept ImageData-like objects (e.g., Node test fixtures)
    const candidate = image as unknown as ImageData;
    const data = candidate.data;
    imageData = {
      data:
        data instanceof Uint8ClampedArray ? data : new Uint8ClampedArray(data as ArrayLike<number>),
      width: candidate.width,
      height: candidate.height,
    } as ImageData;
  } else {
    const ctx = (image as HTMLCanvasElement | OffscreenCanvas).getContext('2d') as
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
    imageData = ctx.getImageData(
      0,
      0,
      (image as HTMLCanvasElement | OffscreenCanvas).width,
      (image as HTMLCanvasElement | OffscreenCanvas).height
    );
  }

  const targets: boolean[][] = [];
  const importance: number[][] = [];

  const scaleX = imageData.width / moduleCount;
  const scaleY = imageData.height / moduleCount;

  // Use 2x2 supersampling for better edge detection
  const samplePoints = [
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
        const imgX = Math.floor((col + dx) * scaleX);
        const imgY = Math.floor((row + dy) * scaleY);
        const idx = (imgY * imageData.width + imgX) * 4;

        const gray = (imageData.data[idx] + imageData.data[idx + 1] + imageData.data[idx + 2]) / 3;
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
