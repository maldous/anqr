export type {
  FitMode,
  OverlayMode,
  OverlayType,
  CropRegion,
  OverlayOptions,
  OverlayDitherOptions,
  ProcessedOverlay,
} from './processor.types';
export { DEFAULT_MOBILE_DITHER } from './default-mobile-dither';
export { STORE_DEFAULT_DITHER } from './store-default-dither';
export { loadImageFromFile } from './load-image-from-file';
export { loadImageFromUrl } from './load-image-from-url';
export { loadImageFromDataUrl } from './load-image-from-data-url';
export { cropOverlayImage } from './crop-overlay-image';
export { fitOverlayImage } from './fit-overlay-image';
export { rotateOverlayCanvas } from './rotate-overlay-canvas';
export { flipOverlayCanvas } from './flip-overlay-canvas';
export { getOverlayDitherKind } from './get-overlay-dither-kind';
export { applyOverlayDither } from './apply-overlay-dither';
export { applyOverlayDitherForQR } from './apply-overlay-dither-for-qr';
export { extractOverlayBrightnessData } from './extract-overlay-brightness-data';
export { extractOverlayRGBData } from './extract-overlay-rgb-data';
export { applyCanvasBlendMode } from './apply-canvas-blend-mode';
export { processOverlay } from './process-overlay';

// Re-export types from dither-algorithms for convenience
export type { DiffusionKernel, DitherKind, OrderedMatrix } from '../../../modules/dither-algorithms/index';
