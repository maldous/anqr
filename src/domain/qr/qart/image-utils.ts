/**
 * QR-Art Image Utilities
 *
 * Utilities for mapping target images to QR module values.
 * Extracted to its own file to avoid circular imports.
 */
import { buildSamplePoints } from './build-sample-points';
import { cleanupBinaryTargets } from './cleanup-binary-targets';
import { resolveImageData } from './resolve-image-data';
import { resolveCleanupArea } from './resolve-cleanup-area';
import { resolveSupersampleLevel } from './resolve-supersample-level';
import { sampleModuleStats } from './sample-module-stats';

/**
 * Map an image to target pixel values with supersampling for better accuracy
 */
import type { MapImageToTargetsOptions } from './image-utils.types';
export type { MapImageToTargetsOptions } from './image-utils.types';

export function mapImageToTargetsSupersampled(
  image: ImageData | HTMLCanvasElement | OffscreenCanvas,
  moduleCount: number,
  threshold: number = 128,
  options?: MapImageToTargetsOptions
): { targets: boolean[][]; importance: number[][] } {
  const emptyResult = {
    targets: Array.from({ length: moduleCount }, () => Array.from({ length: moduleCount }, () => false)),
    importance: Array.from({ length: moduleCount }, () => Array.from({ length: moduleCount }, () => 0)),
  };

  const imageData = resolveImageData(image);
  if (!imageData) return emptyResult;

  const targets: boolean[][] = [];
  const importance: number[][] = [];

  const scaleX = imageData.width / moduleCount;
  const scaleY = imageData.height / moduleCount;
  const maxX = Math.max(0, imageData.width - 1);
  const maxY = Math.max(0, imageData.height - 1);

  const supersampleLevel = resolveSupersampleLevel(options);
  const cleanupSpeckles = options?.cleanupSpeckles !== false;
  const maxDarkSpeckleArea = resolveCleanupArea(options?.maxDarkSpeckleArea, 2);
  const maxLightHoleArea = resolveCleanupArea(options?.maxLightHoleArea, 2);
  const samplePoints = buildSamplePoints(supersampleLevel);

  for (let row = 0; row < moduleCount; row++) {
    targets[row] = [];
    importance[row] = [];

    for (let col = 0; col < moduleCount; col++) {
      const sample = sampleModuleStats(
        imageData,
        samplePoints,
        supersampleLevel,
        row,
        col,
        scaleX,
        scaleY,
        maxX,
        maxY
      );

      targets[row][col] = sample.avgGray < threshold;

      const distanceFromThreshold = Math.abs(sample.avgGray - threshold) / 128;
      const contrastBoost = Math.min(1, sample.contrast / 100);
      const edgeBoost = Math.min(1, sample.edgeMagnitude / 220);
      importance[row][col] = Math.min(
        1,
        distanceFromThreshold * 0.72 + contrastBoost * 0.18 + edgeBoost * 0.36
      );
    }
  }

  const cleanedTargets = cleanupSpeckles
    ? cleanupBinaryTargets(targets, moduleCount, maxDarkSpeckleArea, maxLightHoleArea)
    : targets;

  return { targets: cleanedTargets, importance };
}
