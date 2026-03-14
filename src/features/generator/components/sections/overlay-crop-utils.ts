import type { CropRegion } from './crop-region.type';
import type { MappedPoint } from './mapped-point.type';
export { computeResizedCropRegion } from './compute-resized-crop-region';
import type { OverlayPreservations } from './overlay-preservations.type';

export function isAllPreservationsEnabled(overlay: OverlayPreservations): boolean {
  return (
    overlay.preserveFinders &&
    overlay.preserveTiming &&
    overlay.preserveAlignment &&
    overlay.protectFormatInfo &&
    overlay.protectVersionInfo
  );
}
