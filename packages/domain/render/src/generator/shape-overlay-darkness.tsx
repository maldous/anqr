import { clamp01 } from "./clamp01";

export function shapeOverlayDarkness(overlayDark: number): number {
  const t = clamp01(overlayDark);
  // Preserve shadow anchor while lifting mids so subject structure survives dithering.
  const gammaLift = t ** 0.9;
  const smooth = t * t * (3 - 2 * t);
  const midBoost = gammaLift + 0.14 * (1 - Math.abs(2 * smooth - 1));
  return clamp01(0.58 * gammaLift + 0.42 * midBoost);
}
