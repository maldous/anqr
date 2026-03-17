import type { StoreState } from "./share-config-store.types";
import { buildShareOverlayAdjustmentFields } from "./build-share-overlay-adjustment-fields";
import { buildShareOverlayDitherFields } from "./build-share-overlay-dither-fields";
import { buildShareOverlayDuotoneFields } from "./build-share-overlay-duotone-fields";
import { buildShareOverlayEccFields } from "./build-share-overlay-ecc-fields";
import { buildShareOverlayHalftoneFields } from "./build-share-overlay-halftone-fields";
import { buildShareOverlaySubpixelFields } from "./build-share-overlay-subpixel-fields";
import { omitWhenEqual, undefinedIfEqual, undefinedIfFalsy } from "./share-config-field-helpers";

export function buildShareOverlay(overlay: StoreState["overlay"]) {
  if (!overlay.enabled) return {};
  return {
    mode: overlay.mode,
    intensity: undefinedIfEqual(overlay.intensity, 100),
    overlayUrl: undefinedIfFalsy(overlay.url),
    fit: undefinedIfEqual(overlay.fit, "cover"),
    rotate: undefinedIfEqual(overlay.rotateDeg, 0),
    flipX: omitWhenEqual(overlay.flipX, false),
    flipY: omitWhenEqual(overlay.flipY, false),
    preserveFinders: overlay.preserveFinders ? undefined : false,
    preserveTiming: omitWhenEqual(overlay.preserveTiming, false),
    preserveAlignment: omitWhenEqual(overlay.preserveAlignment, false),
    protectFormatInfo: omitWhenEqual(overlay.protectFormatInfo, false),
    protectVersionInfo: omitWhenEqual(overlay.protectVersionInfo, false),
    ...buildShareOverlayEccFields(overlay),
    ...buildShareOverlayAdjustmentFields(overlay),
    ...buildShareOverlayDitherFields(overlay),
    ...buildShareOverlaySubpixelFields(overlay),
    ...buildShareOverlayHalftoneFields(overlay),
    ...buildShareOverlayDuotoneFields(overlay),
  };
}
