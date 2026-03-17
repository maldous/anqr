import type { RGBWithMeta } from "@/modules/qr-generator/types";

export function resolveHalftoneColor(
  overlayColor: { r: number; g: number; b: number } | undefined,
  neutralColor: { r: number; g: number; b: number } | null,
  overlayBrightness: number,
): RGBWithMeta | null {
  const sizeRatio = 0.5 + overlayBrightness * 0.5;
  if (overlayColor) return { ...overlayColor, halftone: true, sizeRatio };
  if (neutralColor) return { ...neutralColor, halftone: true, sizeRatio };
  return null;
}
