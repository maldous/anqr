import { getContainedImageRect } from './get-contained-image-rect';

export function computeCropOverlayStyle(
  activeCropRegion: { x: number; y: number; size: number },
  previewImageSize: { width: number; height: number } | null,
  containerEl: HTMLDivElement | null
): { left: string; top: string; width: string; height: string } {
  if (!previewImageSize || previewImageSize.width <= 0 || previewImageSize.height <= 0) {
    return {
      left: `${(activeCropRegion.x - activeCropRegion.size / 2) * 100}%`,
      top: `${(activeCropRegion.y - activeCropRegion.size / 2) * 100}%`,
      width: `${activeCropRegion.size * 100}%`,
      height: `${activeCropRegion.size * 100}%`,
    };
  }
  const containerWidth = Math.max(1, containerEl?.clientWidth ?? 1);
  const containerHeight = Math.max(1, containerEl?.clientHeight ?? containerWidth);
  const imageRect = getContainedImageRect(
    containerWidth,
    containerHeight,
    previewImageSize.width,
    previewImageSize.height
  );
  const minEdge = Math.min(previewImageSize.width, previewImageSize.height);
  const cropSizePx = Math.max(1, minEdge * activeCropRegion.size);
  const cropWidthPx = (cropSizePx / previewImageSize.width) * imageRect.width;
  const cropHeightPx = (cropSizePx / previewImageSize.height) * imageRect.height;
  const centerXPx = imageRect.x + activeCropRegion.x * imageRect.width;
  const centerYPx = imageRect.y + activeCropRegion.y * imageRect.height;
  return {
    left: `${((centerXPx - cropWidthPx / 2) / containerWidth) * 100}%`,
    top: `${((centerYPx - cropHeightPx / 2) / containerHeight) * 100}%`,
    width: `${(cropWidthPx / containerWidth) * 100}%`,
    height: `${(cropHeightPx / containerHeight) * 100}%`,
  };
}
