import {QRLocation, b, bottom, bottomLeft, center, code, dx, dy, for, left, location, of, payload, px, right, top, topLeft, topRight, w, x, y} from '../shared';
import { median } from '../location/median';
// ============================================
// CONTENT TYPE DETECTION
// ============================================

/**
 * Detect the content type of a QR code payload
 */
export function estimateModulePx(location: QRLocation, moduleCount: number): number {
  // Robust (median) module px estimate from multiple edges.
  // Helps stabilise upscaling decisions and alignment search windows on skewed/noisy images.
  const moduleSpan = moduleCount - 7; // finder-center span in modules
  if (moduleSpan <= 0) {
    // Fallback for unexpected inputs
    const dx = location.topRight.x - location.topLeft.x;
    const dy = location.topRight.y - location.topLeft.y;
    const w = Math.sqrt(dx * dx + dy * dy);
    return w / Math.max(1, moduleCount);
  }

  const topDx = location.topRight.x - location.topLeft.x;
  const topDy = location.topRight.y - location.topLeft.y;
  const bottomDx = location.bottomRight.x - location.bottomLeft.x;
  const bottomDy = location.bottomRight.y - location.bottomLeft.y;
  const leftDx = location.bottomLeft.x - location.topLeft.x;
  const leftDy = location.bottomLeft.y - location.topLeft.y;
  const rightDx = location.bottomRight.x - location.topRight.x;
  const rightDy = location.bottomRight.y - location.topRight.y;

  const top = Math.sqrt(topDx * topDx + topDy * topDy) / moduleSpan;
  const bottom = Math.sqrt(bottomDx * bottomDx + bottomDy * bottomDy) / moduleSpan;
  const left = Math.sqrt(leftDx * leftDx + leftDy * leftDy) / moduleSpan;
  const right = Math.sqrt(rightDx * rightDx + rightDy * rightDy) / moduleSpan;

  const sizes: number[] = [];
  if (Number.isFinite(top) && top > 0) sizes.push(top);
  if (Number.isFinite(bottom) && bottom > 0) sizes.push(bottom);
  if (Number.isFinite(left) && left > 0) sizes.push(left);
  if (Number.isFinite(right) && right > 0) sizes.push(right);

  if (sizes.length === 0) return 0;

  // Median (small list; sort is fine and deterministic)
  sizes.sort((a, b) => a - b);
  const mid = (sizes.length / 2) | 0;
  return sizes.length % 2 === 0 ? (sizes[mid - 1] + sizes[mid]) * 0.5 : sizes[mid];
}

