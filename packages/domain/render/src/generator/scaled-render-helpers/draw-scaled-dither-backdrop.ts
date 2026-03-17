export function drawScaledDitherBackdrop(
  ctx: CanvasRenderingContext2D,
  overlayCanvas: HTMLCanvasElement | OffscreenCanvas,
  marginPx: number,
  qrDrawSize: number,
  ditherBackdropAlpha: number,
  ditherBackdropWash: number,
  effectiveBgColor: string,
): void {
  const prevSmoothingEnabled = ctx.imageSmoothingEnabled;
  const prevSmoothingQuality = ctx.imageSmoothingQuality;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.save();
  ctx.globalAlpha = ditherBackdropAlpha;
  ctx.drawImage(overlayCanvas as CanvasImageSource, marginPx, marginPx, qrDrawSize, qrDrawSize);
  if (ditherBackdropWash > 0) {
    ctx.globalCompositeOperation = "source-atop";
    ctx.globalAlpha = ditherBackdropWash;
    ctx.fillStyle = effectiveBgColor;
    ctx.fillRect(marginPx, marginPx, qrDrawSize, qrDrawSize);
    ctx.globalCompositeOperation = "source-over";
  }
  ctx.restore();
  ctx.imageSmoothingEnabled = prevSmoothingEnabled;
  ctx.imageSmoothingQuality = prevSmoothingQuality;
}
