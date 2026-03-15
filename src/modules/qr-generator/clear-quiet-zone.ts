import type { QRGeneratorConfig } from './types';

export function clearQuietZone(
  ctx: CanvasRenderingContext2D,
  config: QRGeneratorConfig,
  bgColor: string,
  size: number,
  margin: number,
  moduleCount: number,
  moduleSize: number
): void {
  const qrStart = margin * moduleSize;
  const qrSpan = moduleCount * moduleSize;
  const qrEnd = qrStart + qrSpan;
  if (config.transparentBg) {
    ctx.clearRect(0, 0, size, qrStart);
    ctx.clearRect(0, qrStart, qrStart, qrSpan);
    ctx.clearRect(qrEnd, qrStart, Math.max(0, size - qrEnd), qrSpan);
    ctx.clearRect(0, qrEnd, size, Math.max(0, size - qrEnd));
    return;
  }
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, size, qrStart);
  ctx.fillRect(0, qrStart, qrStart, qrSpan);
  ctx.fillRect(qrEnd, qrStart, Math.max(0, size - qrEnd), qrSpan);
  ctx.fillRect(0, qrEnd, size, Math.max(0, size - qrEnd));
}
