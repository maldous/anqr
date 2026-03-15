import { morphScratchState } from './morph-scratch-state';

export function getMorphScratch(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  width: number,
  height: number
): ImageData {
  if (
    !morphScratchState.imageData ||
    morphScratchState.width !== width ||
    morphScratchState.height !== height
  ) {
    morphScratchState.imageData = ctx.createImageData(width, height);
    morphScratchState.width = width;
    morphScratchState.height = height;
  }

  return morphScratchState.imageData;
}
