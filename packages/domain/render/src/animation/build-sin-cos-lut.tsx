import { TAU } from "./tau";
import { PI4 } from "./pi4";

export function buildSinCosLUT(
  time: number,
  seed: number,
  width: number,
  height: number,
  pattern: "shimmer" | "drift",
): {
  colSin: Float32Array;
  colCos: Float32Array;
  rowSin: Float32Array;
  rowCos: Float32Array;
} {
  const colSin = new Float32Array(width);
  const colCos = new Float32Array(width);
  const rowSin = new Float32Array(height);
  const rowCos = new Float32Array(height);

  if (pattern === "shimmer") {
    const denom = Math.max(1, width + height);
    const shimmerScale = PI4 / denom;
    const base = time + seed;
    for (let x = 0; x < width; x++) {
      const angle = base + x * shimmerScale;
      colSin[x] = Math.sin(angle);
      colCos[x] = Math.cos(angle);
    }
    for (let y = 0; y < height; y++) {
      const angle = y * shimmerScale;
      rowSin[y] = Math.sin(angle);
      rowCos[y] = Math.cos(angle);
    }
  } else {
    const driftX = Math.sin(time + seed) * 0.1;
    const driftY = Math.cos(time + seed) * 0.1;
    const phase = (driftX + driftY) * TAU;
    const invWidth = width > 0 ? 1 / width : 0;
    const invHeight = height > 0 ? 1 / height : 0;
    for (let x = 0; x < width; x++) {
      const angle = x * invWidth * TAU + phase;
      colSin[x] = Math.sin(angle);
      colCos[x] = Math.cos(angle);
    }
    for (let y = 0; y < height; y++) {
      const angle = y * invHeight * TAU;
      rowSin[y] = Math.sin(angle);
      rowCos[y] = Math.cos(angle);
    }
  }

  return { colSin, colCos, rowSin, rowCos };
}
