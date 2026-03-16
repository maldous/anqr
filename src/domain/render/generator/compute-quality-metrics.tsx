import { pixelIndex } from "./pixel-index";
import { clamp01 } from "./clamp01";

export function computeQualityMetrics(
  matrixBits: Uint8Array,
  desire: Float32Array,
  size: number,
  scale: number,
): { artCorrelation: number; edgeImprint: number } {
  if (size === 0) return { artCorrelation: 0, edgeImprint: 0 };

  let mae = 0;
  let count = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = pixelIndex(x, y, size);
      mae += Math.abs(matrixBits[idx] - desire[idx]);
      count++;
    }
  }
  const artCorrelation = 1 - mae / Math.max(1, count);

  let boundaryDiff = 0;
  let nonBoundaryDiff = 0;
  let boundaryCount = 0;
  let nonBoundaryCount = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size - 1; x++) {
      const d = Math.abs(
        matrixBits[pixelIndex(x, y, size)] - matrixBits[pixelIndex(x + 1, y, size)],
      );
      if ((x + 1) % scale === 0) {
        boundaryDiff += d;
        boundaryCount++;
      } else {
        nonBoundaryDiff += d;
        nonBoundaryCount++;
      }
    }
  }
  const b = boundaryDiff / Math.max(1, boundaryCount);
  const n = nonBoundaryDiff / Math.max(1, nonBoundaryCount);
  return { artCorrelation: clamp01(artCorrelation), edgeImprint: b - n };
}
