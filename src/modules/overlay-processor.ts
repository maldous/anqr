/**
 * Overlay Processor Module
 * @deprecated Import from './overlay' instead
 *
 * Handles image loading, cropping, filter application, and blend modes
 */

export {
  processOverlay,
  loadImageFromFile,
  loadImageFromUrl,
  loadImageFromDataUrl,
  cropImage,
  fitImage,
  rotateCanvas,
  flipCanvas,
  ditherOverlay,
  ditherOverlayForQR,
  getEffectiveDitherKind,
  getOverlayData,
  getOverlayRGBData,
  applyOverlayMode,
  OverlayProcessor,
  DEFAULT_MOBILE_DITHER,
  STORE_DEFAULT_DITHER,
  type OverlayOptions,
  type OverlayDitherOptions,
  type ProcessedOverlay,
  type DitherKind,
  type DiffusionKernel,
  type CropRegion,
  type FitMode,
  type OverlayMode,
  type OverlayType,
} from './overlay';

export default OverlayProcessor;
