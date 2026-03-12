import { createLogger } from '../../infra/logging/logger';

export const log = createLogger('GENERATE');

export const HASH_CANVAS_SIZE = 32;

export let sharedHashCanvas: HTMLCanvasElement | OffscreenCanvas | null = null;

export let sharedHashCanvasInUse = false;

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

export async function acquireHashCanvas(
  createCanvasFn: (width: number, height: number) => Promise<HTMLCanvasElement | OffscreenCanvas>
): Promise<{ canvas: HTMLCanvasElement | OffscreenCanvas; release: () => void }> {
  sharedHashCanvas ??= await createHashCanvas(createCanvasFn);

  if (!sharedHashCanvasInUse) {
    sharedHashCanvasInUse = true;
    return {
      canvas: sharedHashCanvas,
      release: () => {
        sharedHashCanvasInUse = false;
      },
    };
  }

  const fallbackCanvas = await createHashCanvas(createCanvasFn);
  return { canvas: fallbackCanvas, release: () => {} };
}

