/**
 * QR Generator Image Filters Module
 * Convolution filters for image preprocessing
 */

/**
 * Apply box blur
 */
export function applyBoxBlur(imageData, radius) {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const copy = new Uint8ClampedArray(data);
  const size = radius * 2 + 1;
  const divisor = size * size;

  for (let y = radius; y < height - radius; y++) {
    for (let x = radius; x < width - radius; x++) {
      let r = 0,
        g = 0,
        b = 0;

      for (let ky = -radius; ky <= radius; ky++) {
        for (let kx = -radius; kx <= radius; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4;
          r += copy[idx];
          g += copy[idx + 1];
          b += copy[idx + 2];
        }
      }

      const outIdx = (y * width + x) * 4;
      data[outIdx] = Math.round(r / divisor);
      data[outIdx + 1] = Math.round(g / divisor);
      data[outIdx + 2] = Math.round(b / divisor);
    }
  }
}

/**
 * Apply sharpen filter
 */
export function applySharpen(imageData, amount) {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const copy = new Uint8ClampedArray(data);

  // Sharpen kernel: center = 1 + 4*amount, neighbors = -amount
  const kernel = [0, -amount, 0, -amount, 1 + 4 * amount, -amount, 0, -amount, 0];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let r = 0,
        g = 0,
        b = 0;
      let ki = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4;
          const k = kernel[ki++];
          r += copy[idx] * k;
          g += copy[idx + 1] * k;
          b += copy[idx + 2] * k;
        }
      }

      const outIdx = (y * width + x) * 4;
      data[outIdx] = Math.max(0, Math.min(255, Math.round(r)));
      data[outIdx + 1] = Math.max(0, Math.min(255, Math.round(g)));
      data[outIdx + 2] = Math.max(0, Math.min(255, Math.round(b)));
    }
  }
}

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

/**
 * Apply preprocessing (brightness, contrast, gamma, saturation, hue rotation, invert,
 * posterize, threshold, blur, sharpen, edge detection) to ImageData.
 * This is a shared helper used by all overlay data loading methods.
 */
export function preprocessImageData(imageData, config, invertImage = false) {
  const data = imageData.data;

  const brightness_adj = config.overlayBrightness || 0;
  const contrast_adj = config.overlayContrast || 0;
  const gamma_adj = config.overlayGamma || 1;
  const saturation_adj = config.overlaySaturation || 0;
  const hueRotate_adj = config.overlayHueRotate || 0;
  const posterize_levels = config.overlayPosterize || 0;
  const threshold_val = config.overlayThreshold;
  const blur_radius = config.overlayBlur || 0;
  const sharpen_amt = config.overlaySharpen || 0;
  const edge_detect = config.overlayEdgeDetect || 'off';

  const needsPerPixelPreprocess =
    brightness_adj !== 0 ||
    contrast_adj !== 0 ||
    gamma_adj !== 1 ||
    saturation_adj !== 0 ||
    hueRotate_adj !== 0 ||
    posterize_levels >= 2 ||
    (threshold_val !== undefined && threshold_val !== 128 && edge_detect === 'off') ||
    invertImage;

  const needsConvolutionFilters =
    blur_radius > 0 || sharpen_amt > 0 || edge_detect === 'sobel' || edge_detect === 'canny';

  if (!(needsPerPixelPreprocess || needsConvolutionFilters)) return imageData;

  // First pass: per-pixel adjustments
  if (needsPerPixelPreprocess) {
    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Brightness
      if (brightness_adj !== 0) {
        const factor = brightness_adj * 2.55;
        r = Math.max(0, Math.min(255, r + factor));
        g = Math.max(0, Math.min(255, g + factor));
        b = Math.max(0, Math.min(255, b + factor));
      }

      // Contrast
      if (contrast_adj !== 0) {
        const factor = (259 * (contrast_adj + 255)) / (255 * (259 - contrast_adj));
        r = Math.max(0, Math.min(255, factor * (r - 128) + 128));
        g = Math.max(0, Math.min(255, factor * (g - 128) + 128));
        b = Math.max(0, Math.min(255, factor * (b - 128) + 128));
      }

      // Gamma
      if (gamma_adj !== 1) {
        const gammaCorrection = 1 / gamma_adj;
        r = 255 * (r / 255) ** gammaCorrection;
        g = 255 * (g / 255) ** gammaCorrection;
        b = 255 * (b / 255) ** gammaCorrection;
      }

      // Saturation
      if (saturation_adj !== 0) {
        const gray = r * 0.299 + g * 0.587 + b * 0.114;
        const factor = (saturation_adj + 100) / 100;
        r = Math.max(0, Math.min(255, gray + factor * (r - gray)));
        g = Math.max(0, Math.min(255, gray + factor * (g - gray)));
        b = Math.max(0, Math.min(255, gray + factor * (b - gray)));
      }

      // Hue rotation
      if (hueRotate_adj !== 0) {
        const angle = (hueRotate_adj * Math.PI) / 180;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const newR =
          r * (0.213 + cos * 0.787 - sin * 0.213) +
          g * (0.715 - cos * 0.715 - sin * 0.715) +
          b * (0.072 - cos * 0.072 + sin * 0.928);
        const newG =
          r * (0.213 - cos * 0.213 + sin * 0.143) +
          g * (0.715 + cos * 0.285 + sin * 0.14) +
          b * (0.072 - cos * 0.072 - sin * 0.283);
        const newB =
          r * (0.213 - cos * 0.213 - sin * 0.787) +
          g * (0.715 - cos * 0.715 + sin * 0.715) +
          b * (0.072 + cos * 0.928 + sin * 0.072);
        r = Math.max(0, Math.min(255, newR));
        g = Math.max(0, Math.min(255, newG));
        b = Math.max(0, Math.min(255, newB));
      }

      // Posterize (need at least 2 levels to avoid division by zero)
      if (posterize_levels >= 2) {
        const levels = posterize_levels;
        const step = 255 / (levels - 1);
        r = Math.round(Math.round(r / step) * step);
        g = Math.round(Math.round(g / step) * step);
        b = Math.round(Math.round(b / step) * step);
      }

      // Threshold (only if edge detection is off)
      if (threshold_val !== undefined && threshold_val !== 128 && edge_detect === 'off') {
        const gray = r * 0.299 + g * 0.587 + b * 0.114;
        const bw = gray > threshold_val ? 255 : 0;
        r = bw;
        g = bw;
        b = bw;
      }

      // Invert
      if (invertImage) {
        r = 255 - r;
        g = 255 - g;
        b = 255 - b;
      }

      data[i] = Math.round(r);
      data[i + 1] = Math.round(g);
      data[i + 2] = Math.round(b);
    }
  }

  // Second pass: convolution filters (blur, sharpen, edge detection)
  if (needsConvolutionFilters) {
    if (blur_radius > 0) {
      applyBoxBlur(imageData, Math.min(blur_radius, 5));
    }

    if (sharpen_amt > 0) {
      applySharpen(imageData, sharpen_amt / 100);
    }

    if (edge_detect === 'sobel') {
      applySobelEdge(imageData);
    } else if (edge_detect === 'canny') {
      applyCannyEdge(imageData);
    }
  }

  return imageData;
}

/**
 * Manual filter application - self-contained implementation
 */
export function applyFiltersManual(imageData, options) {
  const data = imageData.data;

  // First pass: per-pixel adjustments
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Brightness
    if (options.brightness && options.brightness !== 0) {
      const factor = options.brightness * 2.55;
      r = Math.max(0, Math.min(255, r + factor));
      g = Math.max(0, Math.min(255, g + factor));
      b = Math.max(0, Math.min(255, b + factor));
    }

    // Contrast
    if (options.contrast && options.contrast !== 0) {
      const factor = (259 * (options.contrast + 255)) / (255 * (259 - options.contrast));
      r = Math.max(0, Math.min(255, factor * (r - 128) + 128));
      g = Math.max(0, Math.min(255, factor * (g - 128) + 128));
      b = Math.max(0, Math.min(255, factor * (b - 128) + 128));
    }

    // Gamma
    if (options.gamma && options.gamma !== 1) {
      const gammaCorrection = 1 / options.gamma;
      r = 255 * (r / 255) ** gammaCorrection;
      g = 255 * (g / 255) ** gammaCorrection;
      b = 255 * (b / 255) ** gammaCorrection;
    }

    // Saturation
    if (options.saturation && options.saturation !== 0) {
      const gray = r * 0.299 + g * 0.587 + b * 0.114;
      const factor = (options.saturation + 100) / 100;
      r = Math.max(0, Math.min(255, gray + factor * (r - gray)));
      g = Math.max(0, Math.min(255, gray + factor * (g - gray)));
      b = Math.max(0, Math.min(255, gray + factor * (b - gray)));
    }

    // Hue rotation
    if (options.hueRotate && options.hueRotate !== 0) {
      const angle = (options.hueRotate * Math.PI) / 180;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const newR =
        r * (0.213 + cos * 0.787 - sin * 0.213) +
        g * (0.715 - cos * 0.715 - sin * 0.715) +
        b * (0.072 - cos * 0.072 + sin * 0.928);
      const newG =
        r * (0.213 - cos * 0.213 + sin * 0.143) +
        g * (0.715 + cos * 0.285 + sin * 0.14) +
        b * (0.072 - cos * 0.072 - sin * 0.283);
      const newB =
        r * (0.213 - cos * 0.213 - sin * 0.787) +
        g * (0.715 - cos * 0.715 + sin * 0.715) +
        b * (0.072 + cos * 0.928 + sin * 0.072);
      r = Math.max(0, Math.min(255, newR));
      g = Math.max(0, Math.min(255, newG));
      b = Math.max(0, Math.min(255, newB));
    }

    // Posterize
    if (options.posterize && options.posterize > 0) {
      const levels = options.posterize;
      const step = 255 / (levels - 1);
      r = Math.round(Math.round(r / step) * step);
      g = Math.round(Math.round(g / step) * step);
      b = Math.round(Math.round(b / step) * step);
    }

    // Invert
    if (options.invert) {
      r = 255 - r;
      g = 255 - g;
      b = 255 - b;
    }

    data[i] = Math.round(r);
    data[i + 1] = Math.round(g);
    data[i + 2] = Math.round(b);
  }

  // Second pass: convolution filters (blur, sharpen)
  if (options.blur && options.blur > 0) {
    applyBoxBlur(imageData, Math.min(options.blur, 5));
  }

  if (options.sharpen && options.sharpen > 0) {
    applySharpen(imageData, options.sharpen / 100);
  }

  // Edge detection
  if (options.edgeDetect === 'sobel') {
    applySobelEdge(imageData);
  }
}
