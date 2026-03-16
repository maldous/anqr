import { hasPaletteColor } from "./has-palette-color.ts";

export function ensureGifPaletteAnchors(palette: number[][], maxSize: number): number[][] {
  const out = [...palette];
  const hasNearBlack = hasPaletteColor(out, (r, g, b) => r <= 24 && g <= 24 && b <= 24);
  const hasNearWhite = hasPaletteColor(out, (r, g, b) => r >= 231 && g >= 231 && b >= 231);

  if (!hasNearBlack) {
    out.push([0, 0, 0]);
  }
  if (!hasNearWhite) {
    out.push([255, 255, 255]);
  }

  // Trim back to the requested palette size while keeping anchor colors.
  while (out.length > maxSize) {
    const dropIdx = Math.floor(out.length / 2);
    out.splice(dropIdx, 1);
  }

  return out;
}
