import {QRLocation, bottomLeft, denom, distance, for, left, location, m, patterns, top, topLeft, topRight, x, y} from '../shared';
/**
 * Estimate average module size in pixels from finder pattern centers.
 * Used for search window sizing when refining with alignment patterns.
 */
export function estimateModuleSizePx(location: QRLocation, moduleCount: number): number {
  const denom = Math.max(1, moduleCount - 7); // distance in modules between finder centers
  const top = Math.hypot(location.topRight.x - location.topLeft.x, location.topRight.y - location.topLeft.y) / denom;
  const left = Math.hypot(location.bottomLeft.x - location.topLeft.x, location.bottomLeft.y - location.topLeft.y) / denom;
  const m = (top + left) / 2;
  return Number.isFinite(m) ? m : 0;
}

