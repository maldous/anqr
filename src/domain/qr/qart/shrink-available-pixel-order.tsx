export function shrinkAvailablePixelOrder(
  availablePixelOrder: number[],
  controlledPixels: number[],
  assignedPixelMask: Uint8Array,
  totalPixels: number,
): number[] {
  for (const pixel of controlledPixels) {
    if (pixel >= 0 && pixel < totalPixels) {
      assignedPixelMask[pixel] = 1;
    }
  }

  const remainingPixels: number[] = [];
  for (const pixel of availablePixelOrder) {
    if (assignedPixelMask[pixel] === 0) remainingPixels.push(pixel);
  }

  for (const pixel of controlledPixels) {
    if (pixel >= 0 && pixel < totalPixels) {
      assignedPixelMask[pixel] = 0;
    }
  }
  return remainingPixels;
}
