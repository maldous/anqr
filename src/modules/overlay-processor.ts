/**
 * Overlay Processor Module
 * Re-exports overlay processing functionality from overlay module
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
  type OrderedMatrix,
  type FitMode,
  type OverlayMode,
  type OverlayType,
} from './overlay';

export default OverlayProcessor;
