/**
 * QR Generator Filter Preprocessing
 * Image preprocessing filters for overlay optimization
 */

import type { QRGeneratorConfig } from './types';

/**
 * Preprocess image data with configured filters
 */
export function preprocessImageData(
  imageData: ImageData,
  config: QRGeneratorConfig
): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const width = imageData.width;
  const height = imageData.height;

  // Apply brightness
  if (config.filterBrightness !== undefined && config.filterBrightness !== 0) {
    applyBrightness(data, config.filterBrightness);
  }

  // Apply contrast
  if (config.filterContrast !== undefined && config.filterContrast !== 0) {
    applyContrast(data, config.filterContrast);
  }

  // Apply saturation
  if (config.filterSaturation !== undefined && config.filterSaturation !== 0) {
    applySaturation(data, config.filterSaturation);
  }

  // Apply gamma
  if (config.filterGamma !== undefined && config.filterGamma !== 1) {
    applyGamma(data, config.filterGamma);
  }

  // Apply invert
  if (config.filterInvert) {
    applyInvert(data);
  }

  // Apply grayscale
  if (config.filterGrayscale) {
    applyGrayscale(data);
  }

  // Apply threshold
  if (config.filterThreshold !== undefined && config.filterThreshold > 0) {
    applyThreshold(data, config.filterThreshold);
  }

  return new ImageData(data, width, height);
}

function applyBrightness(data: Uint8ClampedArray, amount: number): void {
  const factor = amount * 255;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.max(0, Math.min(255, data[i] + factor));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + factor));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + factor));
  }
}

function applyContrast(data: Uint8ClampedArray, amount: number): void {
  const factor = (259 * (amount * 255 + 255)) / (255 * (259 - amount * 255));
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.max(0, Math.min(255, factor * (data[i] - 128) + 128));
    data[i + 1] = Math.max(0, Math.min(255, factor * (data[i + 1] - 128) + 128));
    data[i + 2] = Math.max(0, Math.min(255, factor * (data[i + 2] - 128) + 128));
  }
}

function applySaturation(data: Uint8ClampedArray, amount: number): void {
  const factor = 1 + amount;
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    data[i] = Math.max(0, Math.min(255, gray + factor * (data[i] - gray)));
    data[i + 1] = Math.max(0, Math.min(255, gray + factor * (data[i + 1] - gray)));
    data[i + 2] = Math.max(0, Math.min(255, gray + factor * (data[i + 2] - gray)));
  }
}

function applyGamma(data: Uint8ClampedArray, gamma: number): void {
  const invGamma = 1 / gamma;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.pow(data[i] / 255, invGamma) * 255;
    data[i + 1] = Math.pow(data[i + 1] / 255, invGamma) * 255;
    data[i + 2] = Math.pow(data[i + 2] / 255, invGamma) * 255;
  }
}

function applyInvert(data: Uint8ClampedArray): void {
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i];
    data[i + 1] = 255 - data[i + 1];
    data[i + 2] = 255 - data[i + 2];
  }
}

function applyGrayscale(data: Uint8ClampedArray): void {
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
  }
}

function applyThreshold(data: Uint8ClampedArray, threshold: number): void {
  const t = threshold * 255;
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    const value = gray > t ? 255 : 0;
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
  }
}
