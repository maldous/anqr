import type { RGBWithMeta } from "../../../modules/qr-generator/types";

export function resolveOverlayColor(
  overlayColor: { r: number; g: number; b: number } | undefined,
  neutralColor: { r: number; g: number; b: number } | null,
): RGBWithMeta | null {
  if (overlayColor) return { ...overlayColor };
  if (neutralColor) return { ...neutralColor };
  return null;
}
