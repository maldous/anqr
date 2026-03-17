import { createEmptyMatrix } from "./create-empty-matrix";
import { readOverlayPixelsAtSize } from "./read-overlay-pixels-at-size";
import type { CreateCanvasFn, PixelDecisionMatrix } from "./types";

export async function resolveMatrixInput(params: {
  createCanvasFn: CreateCanvasFn;
  effectiveIntensity: number;
  moduleCount: number;
  overlayCanvas: HTMLCanvasElement | OffscreenCanvas;
  releaseCanvasFn?: (canvas: HTMLCanvasElement | OffscreenCanvas) => void;
  scale: number;
}): Promise<
  | { emptyMatrix: PixelDecisionMatrix }
  | {
      data: Uint8ClampedArray;
      matrixBits: Uint8Array;
      packedColors: Uint32Array;
      pixelCount: number;
      scaledSize: number;
    }
> {
  const scaledSize = params.moduleCount * params.scale;
  const data = await readOverlayPixelsAtSize(
    params.overlayCanvas,
    scaledSize,
    params.createCanvasFn,
    params.releaseCanvasFn,
  );
  if (!data) {
    return {
      emptyMatrix: createEmptyMatrix(scaledSize, params.scale, params.effectiveIntensity),
    };
  }

  const pixelCount = scaledSize * scaledSize;
  return {
    data,
    matrixBits: new Uint8Array(pixelCount),
    packedColors: new Uint32Array(pixelCount),
    pixelCount,
    scaledSize,
  };
}
