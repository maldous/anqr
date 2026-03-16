import type { OverlayModeContext } from "./overlay-mode-context";
import type { DitherBlendFlags } from "./dither-blend-flags";

export function computeDitherBlendFlags(context: OverlayModeContext): DitherBlendFlags {
  const { overlayMode, config, isFunctionalPattern } = context;
  const isExtreme = overlayMode === "extreme";
  const blendPresFunctional = config.blendPreservations === true && isFunctionalPattern;
  const blendPreservationMode = config.blendPreservationMode === "dither" ? "dither" : "overlay";
  const blendPresFunctionalOverlay = blendPresFunctional && blendPreservationMode === "overlay";
  const blendPresFunctionalDither = blendPresFunctional && blendPreservationMode === "dither";
  const functionalExtremeBlend = isExtreme && blendPresFunctionalOverlay;
  return {
    isExtreme,
    blendPresFunctionalOverlay,
    blendPresFunctionalDither,
    functionalExtremeBlend,
  };
}
