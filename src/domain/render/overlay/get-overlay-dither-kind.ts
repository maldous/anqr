import type { DitherKind } from "../../../modules/dither-algorithms";
import type { OverlayDitherOptions } from "./processor.types";

// ============================================
// DITHERING
// ============================================

export function getOverlayDitherKind(options?: OverlayDitherOptions): DitherKind {
  if (!options?.enabled) return "none";
  return options.kind ?? "floyd_steinberg";
}
