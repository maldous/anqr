import type { CropRegion } from './crop-region.type';
import type { MappedPoint } from './mapped-point.type';

export function computeResizedCropRegion(
  mapped: MappedPoint,
  currentRegion: CropRegion,
  previewImageSize: { width: number; height: number } | null
): number {
  const centerX = currentRegion.x;
  const centerY = currentRegion.y;
  let requestedSize: number;
  let maxSize: number;
  if (previewImageSize && previewImageSize.width > 0 && previewImageSize.height > 0) {
    const minEdge = Math.min(previewImageSize.width, previewImageSize.height);
    const dx = Math.abs(mapped.x - centerX);
    const dy = Math.abs(mapped.y - centerY);
    const sizeByX = (dx * 2 * previewImageSize.width) / minEdge;
    const sizeByY = (dy * 2 * previewImageSize.height) / minEdge;
    requestedSize = Math.max(sizeByX, sizeByY);

    const maxHalfX = Math.min(centerX, 1 - centerX);
    const maxHalfY = Math.min(centerY, 1 - centerY);
    const maxSizeByX = (maxHalfX * 2 * previewImageSize.width) / minEdge;
    const maxSizeByY = (maxHalfY * 2 * previewImageSize.height) / minEdge;
    maxSize = Math.min(1, maxSizeByX, maxSizeByY);
  } else {
    const dx = Math.abs(mapped.x - centerX);
    const dy = Math.abs(mapped.y - centerY);
    requestedSize = Math.max(dx, dy) * 2;
    maxSize = Math.min(1, 2 * Math.min(centerX, 1 - centerX, centerY, 1 - centerY));
  }
  return Math.max(0.1, Math.min(maxSize, requestedSize));
}
