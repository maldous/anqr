import type { ContainedImageRect } from './contained-image-rect.type';

export function getContainedImageRect(
  containerWidth: number,
  containerHeight: number,
  imageWidth: number,
  imageHeight: number
): ContainedImageRect {
  if (containerWidth <= 0 || containerHeight <= 0 || imageWidth <= 0 || imageHeight <= 0) {
    return {
      x: 0,
      y: 0,
      width: Math.max(1, containerWidth),
      height: Math.max(1, containerHeight),
    };
  }
  const containerAspect = containerWidth / containerHeight;
  const imageAspect = imageWidth / imageHeight;
  if (imageAspect > containerAspect) {
    const width = containerWidth;
    const height = width / imageAspect;
    return { x: 0, y: (containerHeight - height) / 2, width, height };
  }
  const height = containerHeight;
  const width = height * imageAspect;
  return { x: (containerWidth - width) / 2, y: 0, width, height };
}
