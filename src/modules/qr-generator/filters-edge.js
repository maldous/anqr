/**
 * QR Generator Filters - Edge Detection
 * Sobel and Canny edge detection implementations
 */

/**
 * Apply Sobel edge detection
 */
export function applySobelEdge(imageData) {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;

  // Convert to grayscale first
  const gray = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    gray[i] = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
  }

  // Sobel kernels
  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0,
        gy = 0;
      let ki = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const grayIdx = (y + ky) * width + (x + kx);
          gx += gray[grayIdx] * sobelX[ki];
          gy += gray[grayIdx] * sobelY[ki];
          ki++;
        }
      }

      const magnitude = Math.min(255, Math.hypot(gx, gy));
      const outIdx = (y * width + x) * 4;
      data[outIdx] = magnitude;
      data[outIdx + 1] = magnitude;
      data[outIdx + 2] = magnitude;
    }
  }
}

/**
 * Apply Canny edge detection (simplified implementation)
 * Uses Gaussian blur -> Sobel gradient -> Non-maximum suppression -> Hysteresis thresholding
 */
export function applyCannyEdge(imageData) {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;

  // Step 1: Convert to grayscale
  const gray = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    gray[i] = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
  }

  // Step 2: Apply Gaussian blur (3x3 kernel)
  const blurred = new Float32Array(width * height);
  const gaussKernel = [1, 2, 1, 2, 4, 2, 1, 2, 1];
  const gaussSum = 16;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let sum = 0;
      let ki = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          sum += gray[(y + ky) * width + (x + kx)] * gaussKernel[ki++];
        }
      }
      blurred[y * width + x] = sum / gaussSum;
    }
  }

  // Step 3: Sobel gradient (magnitude and direction)
  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
  const magnitude = new Float32Array(width * height);
  const direction = new Float32Array(width * height);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0,
        gy = 0;
      let ki = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const val = blurred[(y + ky) * width + (x + kx)];
          gx += val * sobelX[ki];
          gy += val * sobelY[ki];
          ki++;
        }
      }
      const idx = y * width + x;
      magnitude[idx] = Math.hypot(gx, gy);
      direction[idx] = Math.atan2(gy, gx);
    }
  }

  // Step 4: Non-maximum suppression
  const suppressed = new Float32Array(width * height);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const angle = direction[idx];
      const mag = magnitude[idx];

      // Quantize angle to 4 directions (0, 45, 90, 135 degrees)
      let q = 0,
        r = 0;
      const absAngle = Math.abs(angle);

      if (absAngle < Math.PI / 8 || absAngle > (7 * Math.PI) / 8) {
        // Horizontal edge (compare left/right)
        q = magnitude[idx - 1];
        r = magnitude[idx + 1];
      } else if (absAngle >= Math.PI / 8 && absAngle < (3 * Math.PI) / 8) {
        // Diagonal edge (compare top-right/bottom-left)
        if (angle > 0) {
          q = magnitude[(y - 1) * width + (x + 1)];
          r = magnitude[(y + 1) * width + (x - 1)];
        } else {
          q = magnitude[(y - 1) * width + (x - 1)];
          r = magnitude[(y + 1) * width + (x + 1)];
        }
      } else if (absAngle >= (3 * Math.PI) / 8 && absAngle < (5 * Math.PI) / 8) {
        // Vertical edge (compare top/bottom)
        q = magnitude[(y - 1) * width + x];
        r = magnitude[(y + 1) * width + x];
      } else if (angle > 0) {
        // Diagonal edge (compare top-left/bottom-right)
        q = magnitude[(y - 1) * width + (x - 1)];
        r = magnitude[(y + 1) * width + (x + 1)];
      } else {
        q = magnitude[(y - 1) * width + (x + 1)];
        r = magnitude[(y + 1) * width + (x - 1)];
      }

      // Keep only local maxima
      suppressed[idx] = mag >= q && mag >= r ? mag : 0;
    }
  }

  // Step 5: Double threshold and hysteresis
  const highThreshold = 50;
  const lowThreshold = 20;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const val = suppressed[idx];
      let output = 0;

      if (val >= highThreshold) {
        output = 255; // Strong edge
      } else if (val >= lowThreshold) {
        // Weak edge - check if connected to strong edge
        let hasStrongNeighbor = false;
        for (let ky = -1; ky <= 1 && !hasStrongNeighbor; ky++) {
          for (let kx = -1; kx <= 1 && !hasStrongNeighbor; kx++) {
            const ny = y + ky;
            const nx = x + kx;
            if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
              if (suppressed[ny * width + nx] >= highThreshold) {
                hasStrongNeighbor = true;
              }
            }
          }
        }
        output = hasStrongNeighbor ? 255 : 0;
      }

      const outIdx = idx * 4;
      data[outIdx] = output;
      data[outIdx + 1] = output;
      data[outIdx + 2] = output;
    }
  }
}
