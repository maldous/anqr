export function crossfadeIntoContext(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  frame1: HTMLCanvasElement | OffscreenCanvas,
  frame2: HTMLCanvasElement | OffscreenCanvas,
  t: number,
): void {
  ctx.globalAlpha = 1 - t;
  ctx.drawImage(frame1 as CanvasImageSource, 0, 0);
  ctx.globalAlpha = t;
  ctx.drawImage(frame2 as CanvasImageSource, 0, 0);
  ctx.globalAlpha = 1;
}
