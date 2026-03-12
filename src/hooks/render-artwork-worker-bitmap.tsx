import { imageBitmapToCanvas } from './image-bitmap-to-canvas';
import type { QArtWorkerResult } from './q-art-worker-result';

export function renderArtworkWorkerBitmap(params: {
  workerResult: QArtWorkerResult;
  getScratchCanvas: (slot: 0 | 1, w: number, h: number) => HTMLCanvasElement;
  frameIdx: number;
}): HTMLCanvasElement | null {
  if (!params.workerResult.bitmap) return null;
  const rendered = imageBitmapToCanvas(
    params.workerResult.bitmap,
    params.getScratchCanvas(
      (params.frameIdx % 2) as 0 | 1,
      params.workerResult.bitmap.width,
      params.workerResult.bitmap.height
    )
  );
  if (typeof params.workerResult.bitmap.close === 'function') {
    params.workerResult.bitmap.close();
  }
  return rendered;
}
