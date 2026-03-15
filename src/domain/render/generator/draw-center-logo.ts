/**
 * Draw center logo over the QR code
 */
export function drawCenterLogo(
  ctx: CanvasRenderingContext2D,
  logoCanvas: HTMLCanvasElement | OffscreenCanvas,
  canvasSize: number,
  logoSizePercent: number = 20
): void {
  const logoSize = (canvasSize * logoSizePercent) / 100;
  const logoX = (canvasSize - logoSize) / 2;
  const logoY = (canvasSize - logoSize) / 2;

  // Cast to CanvasImageSource for compatibility with both HTMLCanvasElement and OffscreenCanvas
  ctx.drawImage(logoCanvas as CanvasImageSource, logoX, logoY, logoSize, logoSize);
}
