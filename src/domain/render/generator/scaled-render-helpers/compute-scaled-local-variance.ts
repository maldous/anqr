import type { PixelColor } from "../scaled-render-types";

export function computeScaledLocalVariance(
  colors: (PixelColor | null)[][],
  x: number,
  y: number,
): number {
  const centerColor = colors[y]?.[x] as PixelColor | undefined;
  if (!centerColor) return 0;
  const luma = (pixel: PixelColor) => (0.299 * pixel.r + 0.587 * pixel.g + 0.114 * pixel.b) / 255;
  const center = luma(centerColor);
  let sum = 0;
  let count = 0;
  const neighbors = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  for (const [offsetX, offsetY] of neighbors) {
    const neighbor = colors[y + offsetY]?.[x + offsetX] as PixelColor | undefined;
    if (!neighbor) continue;
    const delta = luma(neighbor) - center;
    sum += delta * delta;
    count++;
  }
  return count > 0 ? Math.min(1, Math.sqrt(sum / count) * 3) : 0;
}
