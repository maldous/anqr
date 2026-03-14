import type { QRGeneratorConfig } from './types';
import type { ScanGateRasterMetrics } from './scan-gate-raster-metrics.type';

export function computeScanGateRasterMetrics(
  src: HTMLCanvasElement | OffscreenCanvas,
  moduleCount: number,
  config: QRGeneratorConfig
): ScanGateRasterMetrics | null {
  const ctx = src.getContext('2d') as CanvasRenderingContext2D | null;
  if (!ctx) return null;
  const { width, height } = src;
  const imageData = ctx.getImageData(0, 0, width, height).data;
  const grayAt = (x: number, y: number): number => {
    const xx = Math.max(0, Math.min(width - 1, Math.round(x)));
    const yy = Math.max(0, Math.min(height - 1, Math.round(y)));
    const i = (yy * width + xx) * 4;
    return (0.299 * imageData[i] + 0.587 * imageData[i + 1] + 0.114 * imageData[i + 2]) / 255;
  };

  const quietZoneMin = config.quietZoneMinEnforce === false ? 0 : 4;
  const marginModules = Math.max(quietZoneMin, config.margin);
  const qrPitch = width / Math.max(1, moduleCount + marginModules * 2);
  const qrSpan = moduleCount * qrPitch;
  const qrStartX = (width - qrSpan) / 2;
  const qrStartY = (height - qrSpan) / 2;

  let boundary = 0;
  let nonBoundary = 0;
  let bc = 0;
  let nc = 0;
  let sum = 0;
  let sumSq = 0;
  let cnt = 0;

  for (let yy = qrStartY + 1; yy < qrStartY + qrSpan - 1; yy += Math.max(1, qrPitch / 2)) {
    for (let xx = qrStartX + 1; xx < qrStartX + qrSpan - 1; xx += 1) {
      const g = grayAt(xx, yy);
      sum += g;
      sumSq += g * g;
      cnt++;
      const d = Math.abs(g - grayAt(xx + 1, yy));
      const rel = (xx - qrStartX + 1) / Math.max(1e-6, qrPitch);
      const frac = Math.abs(rel - Math.round(rel));
      if (frac < 0.08) {
        boundary += d;
        bc++;
      } else {
        nonBoundary += d;
        nc++;
      }
    }
  }
  const mean = sum / Math.max(1, cnt);
  const toneStd = Math.sqrt(Math.max(0, sumSq / Math.max(1, cnt) - mean * mean));
  return {
    edgeImprint: boundary / Math.max(1, bc) - nonBoundary / Math.max(1, nc),
    toneStd,
  };
}
