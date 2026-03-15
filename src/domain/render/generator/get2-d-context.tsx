import type { ReadbackCtx } from './readback-ctx';

export function get2DContext(canvas: HTMLCanvasElement | OffscreenCanvas): ReadbackCtx | null {
  return (
    (canvas.getContext('2d', {
      willReadFrequently: true,
      desynchronized: true,
    } as CanvasRenderingContext2DSettings | undefined) as ReadbackCtx | null) ??
    (canvas.getContext('2d') as ReadbackCtx | null)
  );
}
