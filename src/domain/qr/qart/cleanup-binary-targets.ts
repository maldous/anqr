import { removeSmallComponents } from './remove-small-components';

export function cleanupBinaryTargets(
  targets: boolean[][],
  moduleCount: number,
  maxDarkSpeckleArea: number,
  maxLightHoleArea: number
): boolean[][] {
  const cleaned = targets.map((row) => row.slice());
  if (moduleCount <= 0) return cleaned;

  if (maxDarkSpeckleArea > 0) {
    removeSmallComponents(cleaned, moduleCount, true, maxDarkSpeckleArea, false);
  }

  if (maxLightHoleArea > 0) {
    removeSmallComponents(cleaned, moduleCount, false, maxLightHoleArea, true);
  }

  return cleaned;
}
