import type { StoreState } from './share-config-store-state.type';
import { buildShareOverlayAdjustmentFields } from './build-share-overlay-adjustment-fields';
import { buildShareOverlayDitherFields } from './build-share-overlay-dither-fields';
import { buildShareOverlayDuotoneFields } from './build-share-overlay-duotone-fields';
import { buildShareOverlayEccFields } from './build-share-overlay-ecc-fields';
import { buildShareOverlayHalftoneFields } from './build-share-overlay-halftone-fields';
import { buildShareOverlaySubpixelFields } from './build-share-overlay-subpixel-fields';
import { trueIfTrue, undefinedIfEqual, undefinedIfFalsy } from './share-config-field-helpers';

export function buildShareOverlay(overlay: StoreState['overlay']) {
  if (!overlay.enabled) return {};
  return {
    mode: overlay.mode,
    intensity: undefinedIfEqual(overlay.intensity, 100),
    overlayUrl: undefinedIfFalsy(overlay.url),
    fit: undefinedIfEqual(overlay.fit, 'cover'),
    rotate: undefinedIfEqual(overlay.rotateDeg, 0),
    flipX: trueIfTrue(overlay.flipX),
    flipY: trueIfTrue(overlay.flipY),
    preserveFinders: overlay.preserveFinders ? undefined : false,
    preserveTiming: trueIfTrue(overlay.preserveTiming),
    preserveAlignment: trueIfTrue(overlay.preserveAlignment),
    protectFormatInfo: trueIfTrue(overlay.protectFormatInfo),
    protectVersionInfo: trueIfTrue(overlay.protectVersionInfo),
    ...buildShareOverlayEccFields(overlay),
    ...buildShareOverlayAdjustmentFields(overlay),
    ...buildShareOverlayDitherFields(overlay),
    ...buildShareOverlaySubpixelFields(overlay),
    ...buildShareOverlayHalftoneFields(overlay),
    ...buildShareOverlayDuotoneFields(overlay),
  };
}
