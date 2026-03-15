import type { PixelColor } from '../scaled-render-types';

export function sampleScaledModuleOverlayColor(
  colors: (PixelColor | null)[][],
  scaledSize: number,
  scale: number,
  row: number,
  col: number
): PixelColor | null {
  if (!colors?.length) return null;
  const px = Math.max(0, Math.min(scaledSize - 1, Math.floor((col + 0.5) * scale)));
  const py = Math.max(0, Math.min(scaledSize - 1, Math.floor((row + 0.5) * scale)));
  return (colors[py]?.[px] as PixelColor | undefined) ?? null;
}
