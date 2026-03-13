export function resetCanvas2D(
  canvas: HTMLCanvasElement | OffscreenCanvas
): CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  if ('setTransform' in ctx && typeof ctx.setTransform === 'function') {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  if ('filter' in ctx) {
    (ctx as CanvasRenderingContext2D).filter = 'none';
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  return ctx;
}
