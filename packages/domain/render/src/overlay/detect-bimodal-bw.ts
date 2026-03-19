import { rgbToLumaLinear } from "../color/color";
import {
  BUCKET_SHIFT,
  DARK_REGION_END,
  HISTOGRAM_BUCKETS,
  LIGHT_REGION_START,
  MAX_VALLEY_RATIO,
  MIN_PEAK_RATIO,
  MIN_PEAK_SEPARATION,
} from "./bimodal-histogram.constants";
import { log } from "./log";

export function detectBimodalBW(imageData: ImageData): boolean {
  const data = imageData.data;
  const totalPixels = data.length / 4;
  const histogram = new Int32Array(HISTOGRAM_BUCKETS);

  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.floor(rgbToLumaLinear(data[i], data[i + 1], data[i + 2]) * 255);
    const bucket = Math.min(HISTOGRAM_BUCKETS - 1, gray >> BUCKET_SHIFT);
    histogram[bucket]++;
  }

  let darkPeak = 0;
  let darkPeakBucket = 0;
  for (let i = 0; i < DARK_REGION_END; i++) {
    if (histogram[i] > darkPeak) {
      darkPeak = histogram[i];
      darkPeakBucket = i;
    }
  }

  let lightPeak = 0;
  let lightPeakBucket = 0;
  for (let i = LIGHT_REGION_START; i < HISTOGRAM_BUCKETS; i++) {
    if (histogram[i] > lightPeak) {
      lightPeak = histogram[i];
      lightPeakBucket = i;
    }
  }

  if (lightPeakBucket - darkPeakBucket < MIN_PEAK_SEPARATION) {
    return false;
  }

  let darkRegionCount = 0;
  for (let i = 0; i < DARK_REGION_END; i++) {
    darkRegionCount += histogram[i];
  }

  let lightRegionCount = 0;
  for (let i = LIGHT_REGION_START; i < HISTOGRAM_BUCKETS; i++) {
    lightRegionCount += histogram[i];
  }

  let valleyCount = 0;
  for (let i = DARK_REGION_END; i < LIGHT_REGION_START; i++) {
    valleyCount += histogram[i];
  }

  const darkRatio = darkRegionCount / totalPixels;
  const lightRatio = lightRegionCount / totalPixels;
  const valleyRatio = valleyCount / totalPixels;

  const isBimodal =
    darkRatio >= MIN_PEAK_RATIO && lightRatio >= MIN_PEAK_RATIO && valleyRatio < MAX_VALLEY_RATIO;

  if (isBimodal) {
    log.debug("Detected bimodal B&W image", {
      darkRatio: darkRatio.toFixed(3),
      lightRatio: lightRatio.toFixed(3),
      valleyRatio: valleyRatio.toFixed(3),
      darkPeakBucket,
      lightPeakBucket,
    });
  }

  return isBimodal;
}
