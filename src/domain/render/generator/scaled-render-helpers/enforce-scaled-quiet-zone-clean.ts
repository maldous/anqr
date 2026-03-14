export function enforceScaledQuietZoneClean(
  ctx: CanvasRenderingContext2D,
  marginPx: number,
  moduleCount: number,
  effectiveModuleSize: number,
  size: number,
  transparentBg: boolean,
  effectiveBgColor: string
): void {
  if (marginPx <= 0) return;
  const qrStart = marginPx;
  const qrSize = moduleCount * effectiveModuleSize;
  const qrEnd = qrStart + qrSize;
  if (transparentBg) {
    ctx.clearRect(0, 0, size, qrStart);
    ctx.clearRect(0, qrStart, qrStart, qrSize);
    ctx.clearRect(qrEnd, qrStart, Math.max(0, size - qrEnd), qrSize);
    ctx.clearRect(0, qrEnd, size, Math.max(0, size - qrEnd));
    return;
  }
  ctx.fillStyle = effectiveBgColor;
  ctx.fillRect(0, 0, size, qrStart);
  ctx.fillRect(0, qrStart, qrStart, qrSize);
  ctx.fillRect(qrEnd, qrStart, Math.max(0, size - qrEnd), qrSize);
  ctx.fillRect(0, qrEnd, size, Math.max(0, size - qrEnd));
}
