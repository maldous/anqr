import {
  BUCKET_SHIFT,
  DARK_REGION_END,
  HISTOGRAM_BUCKETS,
  LIGHT_REGION_START,
  MAX_VALLEY_RATIO,
  MIN_PEAK_RATIO,
  MIN_PEAK_SEPARATION,
} from "./dithering-constants";
import { getOverlayBrightness } from "../overlay/overlay-data-packed";
import type { OverlayData } from "@/domain/render/qr-generator-shared";

export function detectBWFromOverlayData(overlayData: OverlayData, moduleCount: number): boolean {
  const histogram = new Int32Array(HISTOGRAM_BUCKETS);
  let totalPixels = 0;

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      const brightness = getOverlayBrightness(overlayData, row, col);
      const gray = Math.floor(brightness * 255);
      const bucket = Math.min(HISTOGRAM_BUCKETS - 1, gray >> BUCKET_SHIFT);
      histogram[bucket]++;
      totalPixels++;
    }
  }

  if (totalPixels === 0) return false;

  let darkPeakBucket = 0;
  let lightPeakBucket = 0;
  let darkPeak = 0;
  let lightPeak = 0;

  for (let i = 0; i < DARK_REGION_END; i++) {
    if (histogram[i] > darkPeak) {
      darkPeak = histogram[i];
      darkPeakBucket = i;
    }
  }
  for (let i = LIGHT_REGION_START; i < HISTOGRAM_BUCKETS; i++) {
    if (histogram[i] > lightPeak) {
      lightPeak = histogram[i];
      lightPeakBucket = i;
    }
  }

  if (lightPeakBucket - darkPeakBucket < MIN_PEAK_SEPARATION) return false;

  let darkCount = 0;
  let lightCount = 0;
  let valleyCount = 0;
  for (let i = 0; i < DARK_REGION_END; i++) darkCount += histogram[i];
  for (let i = LIGHT_REGION_START; i < HISTOGRAM_BUCKETS; i++) lightCount += histogram[i];
  for (let i = DARK_REGION_END; i < LIGHT_REGION_START; i++) valleyCount += histogram[i];

  return (
    darkCount / totalPixels >= MIN_PEAK_RATIO &&
    lightCount / totalPixels >= MIN_PEAK_RATIO &&
    valleyCount / totalPixels < MAX_VALLEY_RATIO
  );
}
