/**
 * QR Generator Filters - Preprocessing
 * Main image preprocessing functions
 */

import { applyBoxBlur } from './filters-blur.js';
import { applySharpen } from './filters-sharpen.js';
import { applySobelEdge, applyCannyEdge } from './filters-edge.js';

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
