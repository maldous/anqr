import { rgbToLumaLinear } from '../color/color';
import {
  BUCKET_SHIFT,
  DARK_REGION_END,
  HISTOGRAM_BUCKETS,
  LIGHT_REGION_START,
  MAX_VALLEY_RATIO,
  MIN_PEAK_RATIO,
  MIN_PEAK_SEPARATION,
} from '../dither/dithering-constants';
import { log } from './filters-preprocess._internal';

/**
 * Detect if an image is high-contrast B&W (bimodal histogram).
 * Uses histogram analysis similar to GlobalHistogramBinarizer from QR decoder.
 *
 * A bimodal B&W image has:
 * - A strong peak near 0 (black)
 * - A strong peak near 255 (white)
 * - Very few pixels in the middle (the valley)
 *
 * @param imageData - The image data to analyze
 * @returns true if the image appears to be high-contrast B&W
 */
export function detectBimodalBW(imageData: ImageData): boolean {
  const data = imageData.data;
  const totalPixels = data.length / 4;

  // Build luminance histogram
  const histogram = new Int32Array(HISTOGRAM_BUCKETS);

  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.floor(rgbToLumaLinear(data[i], data[i + 1], data[i + 2]) * 255);
    const bucket = Math.min(HISTOGRAM_BUCKETS - 1, gray >> BUCKET_SHIFT);
    histogram[bucket]++;
  }

  // Find peak in dark region (buckets 0-7)
  let darkPeak = 0;
  let darkPeakBucket = 0;
  for (let i = 0; i < DARK_REGION_END; i++) {
    if (histogram[i] > darkPeak) {
      darkPeak = histogram[i];
      darkPeakBucket = i;
    }
  }

  // Find peak in light region (buckets 24-31)
  let lightPeak = 0;
  let lightPeakBucket = 0;
  for (let i = LIGHT_REGION_START; i < HISTOGRAM_BUCKETS; i++) {
    if (histogram[i] > lightPeak) {
      lightPeak = histogram[i];
      lightPeakBucket = i;
    }
  }

  // Check peak separation
  if (lightPeakBucket - darkPeakBucket < MIN_PEAK_SEPARATION) {
    return false;
  }

  // Count pixels in each region
  let darkRegionCount = 0;
  for (let i = 0; i < DARK_REGION_END; i++) {
    darkRegionCount += histogram[i];
  }

  let lightRegionCount = 0;
  for (let i = LIGHT_REGION_START; i < HISTOGRAM_BUCKETS; i++) {
    lightRegionCount += histogram[i];
  }

  // Count pixels in the valley (middle region)
  let valleyCount = 0;
  for (let i = DARK_REGION_END; i < LIGHT_REGION_START; i++) {
    valleyCount += histogram[i];
  }

  // Check bimodal criteria
  const darkRatio = darkRegionCount / totalPixels;
  const lightRatio = lightRegionCount / totalPixels;
  const valleyRatio = valleyCount / totalPixels;

  const isBimodal =
    darkRatio >= MIN_PEAK_RATIO && lightRatio >= MIN_PEAK_RATIO && valleyRatio < MAX_VALLEY_RATIO;

  if (isBimodal) {
    log.debug('Detected bimodal B&W image', {
      darkRatio: darkRatio.toFixed(3),
      lightRatio: lightRatio.toFixed(3),
      valleyRatio: valleyRatio.toFixed(3),
      darkPeakBucket,
      lightPeakBucket,
    });
  }

  return isBimodal;
}
