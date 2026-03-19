import type { CanvasPool } from "./canvas-pool";
import { clampN } from "./clamp-n";

export async function computeOverlayComplexity(
  pool: CanvasPool,
  overlayCanvas: HTMLCanvasElement | OffscreenCanvas | null,
  sampleSize: number,
): Promise<number> {
  if (!overlayCanvas) return 0;
  const analysisCanvas = await pool.acquire(sampleSize, sampleSize);
  try {
    analysisCanvas.width = sampleSize;
    analysisCanvas.height = sampleSize;
    const analysisCtx =
      (analysisCanvas.getContext("2d", {
        willReadFrequently: true,
        desynchronized: true,
      } as CanvasRenderingContext2DSettings) as CanvasRenderingContext2D | null) ??
      (analysisCanvas.getContext("2d") as CanvasRenderingContext2D | null);
    if (!analysisCtx) return 0;

    analysisCtx.imageSmoothingEnabled = true;
    analysisCtx.imageSmoothingQuality = "high";
    analysisCtx.clearRect(0, 0, sampleSize, sampleSize);
    analysisCtx.drawImage(overlayCanvas as CanvasImageSource, 0, 0, sampleSize, sampleSize);

    const pixels = analysisCtx.getImageData(0, 0, sampleSize, sampleSize).data;
    const sampleCount = sampleSize * sampleSize;
    const luma = new Float32Array(sampleCount);

    let sum = 0;
    for (let i = 0; i < sampleCount; i++) {
      const idx = i * 4;
      const value = (0.299 * pixels[idx] + 0.587 * pixels[idx + 1] + 0.114 * pixels[idx + 2]) / 255;
      luma[i] = value;
      sum += value;
    }
    const mean = sum / Math.max(1, sampleCount);

    let variance = 0;
    let edge = 0;
    let edgeCount = 0;
    for (let y = 0; y < sampleSize; y++) {
      for (let x = 0; x < sampleSize; x++) {
        const idx = y * sampleSize + x;
        const v = luma[idx];
        const d = v - mean;
        variance += d * d;
        if (x + 1 < sampleSize) {
          edge += Math.abs(v - luma[idx + 1]);
          edgeCount++;
        }
        if (y + 1 < sampleSize) {
          edge += Math.abs(v - luma[idx + sampleSize]);
          edgeCount++;
        }
      }
    }
    const toneStd = Math.sqrt(variance / Math.max(1, sampleCount));
    const edgeDensity = edge / Math.max(1, edgeCount);
    return clampN(toneStd * 1.8 + edgeDensity * 1.2, 0, 1);
  } catch {
    return 0;
  } finally {
    pool.release(analysisCanvas);
  }
}
