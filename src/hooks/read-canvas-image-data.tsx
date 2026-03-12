export function readCanvasImageData(canvas: HTMLCanvasElement | OffscreenCanvas): ImageData {
  const ctx =
    (canvas.getContext('2d', {
      willReadFrequently: true,
      desynchronized: true,
    } as CanvasRenderingContext2DSettings | undefined) as
      | CanvasRenderingContext2D
      | OffscreenCanvasRenderingContext2D
      | null) ??
    (canvas.getContext('2d') as
      | CanvasRenderingContext2D
      | OffscreenCanvasRenderingContext2D
      | null);
  if (!ctx) {
    throw new Error('Unable to read overlay pixels for QR-Art worker');
  }
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}
