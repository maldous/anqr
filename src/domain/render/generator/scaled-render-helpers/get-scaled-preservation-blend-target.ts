import type { QRCodeInstance } from "../../../../modules/qr-generator/types";
import type { PixelColor } from "../scaled-render-types";
import { adjustLumaPreserveChroma } from "./adjust-luma-preserve-chroma";
import { sampleScaledModuleOverlayColor } from "./sample-scaled-module-overlay-color";

export function getScaledPreservationBlendTarget(
  qr: QRCodeInstance,
  colors: (PixelColor | null)[][],
  matrix: boolean[][],
  scaledSize: number,
  scale: number,
  isDitheredMode: boolean,
  moduleRow: number,
  moduleCol: number,
  scaledRow: number,
  scaledCol: number,
): { r: number; g: number; b: number } {
  const moduleDark = qr.isDark(moduleRow, moduleCol);
  const sampled =
    (colors[scaledRow]?.[scaledCol] as PixelColor | undefined) ??
    sampleScaledModuleOverlayColor(colors, scaledSize, scale, moduleRow, moduleCol);
  if (!sampled) {
    return moduleDark ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 };
  }
  const pixelDark = matrix[scaledRow]?.[scaledCol] === true;
  if (isDitheredMode) {
    if (moduleDark) {
      return pixelDark
        ? adjustLumaPreserveChroma(sampled, 0.04, 1.65)
        : adjustLumaPreserveChroma(sampled, 0.18, 1.3);
    }
    return pixelDark
      ? adjustLumaPreserveChroma(sampled, 0.9, 0.9)
      : adjustLumaPreserveChroma(sampled, 0.97, 0.8);
  }
  if (moduleDark) {
    return pixelDark
      ? adjustLumaPreserveChroma(sampled, 0.08, 1.28)
      : adjustLumaPreserveChroma(sampled, 0.2, 1.14);
  }
  return pixelDark
    ? adjustLumaPreserveChroma(sampled, 0.88, 0.95)
    : adjustLumaPreserveChroma(sampled, 0.97, 0.84);
}
