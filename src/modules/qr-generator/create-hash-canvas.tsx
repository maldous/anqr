import { HASH_CANVAS_SIZE } from './hash-canvas-size';

export async function createHashCanvas(
  createCanvasFn: (width: number, height: number) => Promise<HTMLCanvasElement | OffscreenCanvas>
): Promise<HTMLCanvasElement | OffscreenCanvas> {
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = HASH_CANVAS_SIZE;
    canvas.height = HASH_CANVAS_SIZE;
    return canvas;
  }
  return await createCanvasFn(HASH_CANVAS_SIZE, HASH_CANVAS_SIZE);
}
