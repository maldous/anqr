import type { DitherKind } from "../dither-algorithms";
import type { OverlayDitherOptions } from "./processor.types";

// ============================================
// DITHERING
// ============================================

export function getOverlayDitherKind(options?: OverlayDitherOptions): DitherKind {
  if (!options?.enabled) return "none";
  return options.kind ?? "floyd_steinberg";
}
