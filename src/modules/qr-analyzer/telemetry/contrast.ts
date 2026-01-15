/*
/**
 * Estimate global image contrast using a sampled luminance histogram.
 * Returns a stable, low-cost metric that works before binarization.
 *
 * contrast = (p90 - p10) / 255
 */
const __qrLumaHist = new Uint32Array(256);

export function estimateImageContrast(imageData: ImageData): {
  contrast: number;
  mean: number;
  std: number;
  p10: number;
  p90: number;
} {
  // Reset histogram (fixed cost, deterministic)
  for (let i = 0; i < 256; i++) __qrLumaHist[i] = 0;

  const d = imageData.data;
  const nBytes = d.length;

  // Sample up to ~50k pixels to bound cost on large images.
  // Stride is in bytes, must be multiple of 4.
  const targetSamples = 50000;
  const totalPixels = nBytes >> 2;
  const stepPixels = totalPixels > targetSamples ? Math.floor(totalPixels / targetSamples) : 1;
  const step = stepPixels << 2;

  // Welford running mean/std on luminance
  let count = 0;
  let mean = 0;
  let m2 = 0;

  for (let i = 0; i < nBytes; i += step) {
    const r = d[i];
    const g = d[i + 1];
    const b = d[i + 2];

    // Fast integer luma approximation, 0..255
    const l = (0.299 * r + 0.587 * g + 0.114 * b) | 0;

    __qrLumaHist[l]++;

    count++;
    const delta = l - mean;
    mean += delta / count;
    const delta2 = l - mean;
    m2 += delta * delta2;
  }

  const variance = count > 1 ? m2 / (count - 1) : 0;
  const std = Math.sqrt(variance);

  // Percentiles from histogram (deterministic, coarse)
  const p10Target = Math.max(1, Math.floor(count * 0.10));
  const p90Target = Math.max(1, Math.floor(count * 0.90));

  let cum = 0;
  let p10 = 0;
  let p90 = 255;
  let gotP10 = false;

  for (let l = 0; l < 256; l++) {
    const c = __qrLumaHist[l];
    if (!c) continue;
    cum += c;
    if (!gotP10 && cum >= p10Target) {
      p10 = l;
      gotP10 = true;
    }
    if (cum >= p90Target) {
      p90 = l;
      break;
    }
  }

  const contrast = (p90 - p10) / 255;

  return { contrast, mean, std, p10, p90 };
}
