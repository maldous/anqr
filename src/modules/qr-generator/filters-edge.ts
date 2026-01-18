/**
 * QR Generator Edge Detection Filters
 * Sobel and Canny edge detection implementations
 */

/**
 * Apply Sobel edge detection
 */
export function applySobelEdge(imageData: ImageData): ImageData {
  const { width, height, data } = imageData;
  const output = new Uint8ClampedArray(data.length);

  // Sobel kernels
  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0, gy = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4;
          const gray = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
          const ki = (ky + 1) * 3 + (kx + 1);

          gx += gray * sobelX[ki];
          gy += gray * sobelY[ki];
        }
      }

      const magnitude = Math.sqrt(gx * gx + gy * gy);
      const idx = (y * width + x) * 4;

      output[idx] = magnitude;
      output[idx + 1] = magnitude;
      output[idx + 2] = magnitude;
      output[idx + 3] = 255;
    }
  }

  return new ImageData(output, width, height);
}

/**
 * Apply Canny edge detection (simplified)
 */
export function applyCannyEdge(
  imageData: ImageData,
  lowThreshold: number = 50,
  highThreshold: number = 150
): ImageData {
  // First apply Sobel
  const sobelResult = applySobelEdge(imageData);
  const { width, height, data } = sobelResult;
  const output = new Uint8ClampedArray(data.length);

  // Apply double threshold
  for (let i = 0; i < data.length; i += 4) {
    const magnitude = data[i];

    if (magnitude >= highThreshold) {
      // Strong edge
      output[i] = 255;
      output[i + 1] = 255;
      output[i + 2] = 255;
    } else if (magnitude >= lowThreshold) {
      // Weak edge
      output[i] = 128;
      output[i + 1] = 128;
      output[i + 2] = 128;
    } else {
      // Not an edge
      output[i] = 0;
      output[i + 1] = 0;
      output[i + 2] = 0;
    }
    output[i + 3] = 255;
  }

  return new ImageData(output, width, height);
}
