import type { QRLocationCorners } from './decoder-types';

export function analyzeQuietZone(
  imageData: ImageData,
  location: QRLocationCorners,
  modulePx: number
): { top: number; right: number; bottom: number; left: number; adequate: boolean } {
  const top = Math.max(0, Math.floor(location.topLeftCorner.y / modulePx));
  const left = Math.max(0, Math.floor(location.topLeftCorner.x / modulePx));
  const bottom = Math.max(
    0,
    Math.floor((imageData.height - location.bottomLeftCorner.y) / modulePx)
  );
  const right = Math.max(0, Math.floor((imageData.width - location.topRightCorner.x) / modulePx));
  const adequate = top >= 4 && right >= 4 && bottom >= 4 && left >= 4;

  return { top, right, bottom, left, adequate };
}
