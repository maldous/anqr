import type { PixelColor } from '../scaled-render-types';

export function adjustLumaPreserveChroma(
  color: PixelColor,
  targetLuma: number,
  chromaScale: number
): { r: number; g: number; b: number } {
  const gray = (color.r + color.g + color.b) / 3;
  let r = gray + (color.r - gray) * chromaScale;
  let g = gray + (color.g - gray) * chromaScale;
  let b = gray + (color.b - gray) * chromaScale;
  const currentLuma = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const delta = (targetLuma - currentLuma) * 255;
  r = Math.max(0, Math.min(255, r + delta));
  g = Math.max(0, Math.min(255, g + delta));
  b = Math.max(0, Math.min(255, b + delta));
  return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
}
