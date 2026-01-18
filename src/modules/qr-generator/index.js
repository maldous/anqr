/**
 * QR Generator Module
 * Re-exports from split module files
 */

// Cache utilities
export { MemoCache, alignmentCache, canvasHashCache, clearQRCaches, overlayDataCache, qrMatrixCache } from './cache.js';

// Canvas factory
export { defaultBrowserCanvasFactory } from './canvas-factory.js';

// Utility functions
export { createSeededRandom, getContrastRatio, hashCanvasContent, hashString } from './utils.js';

// Drawing functions
export {
  createGradientFill,
  drawAlignmentPattern,
  drawCenterLogo,
  drawFinderModule,
  drawFinderPatternComplete,
  drawFrame,
  drawFrameBackground,
  drawHalftoneModule,
  drawModule,
  drawTimingModule,
  roundRect,
} from './drawing.js';

// Image filters
export {
  applyBoxBlur,
  applyCannyEdge,
  applyFiltersManual,
  applySharpen,
  applySobelEdge,
  preprocessImageData,
} from './filters.js';

// Color utilities
export {
  applyPaletteColor,
  applyPerModuleColor,
  darkenColor,
  ensureContrast,
  lightenColor,
} from './color.js';

// Dithering
export {
  applyAdvancedDither,
  applyDitherToMatrix,
  applyTrueDither,
  distributeError,
  getDiffusionKernel,
} from './dithering.js';

// Overlay processing
export {
  applyGeometricTransforms,
  generateSubpixelMatrix,
  getOverlayData,
  getSubpixelOverlayData,
  hasGeometricTransforms,
  hasPreprocessingOptions,
  loadImageDataRGB,
  preprocessOverlay,
} from './overlay.js';

// ECC awareness
export { getEccWeight, isEccSafeToModify } from './ecc.js';

// Pattern helpers
export { getAlignmentPositions, isFormatInfo, isVersionInfo } from './pattern-helpers.js';

// Pixel matrix generation
export { generatePixelDecisionMatrix, getScaleFactor, prepareUnifiedOverlayData } from './pixel-matrix.js';

// Overlay mode rendering
export { applyOverlayMode } from './render-modes.js';

// Module render loop
export { renderModules } from './render-loop.js';

// Scaled QR rendering
export { generateScaledQR } from './scaled-render.js';

// Main QRGenerator class
export { QRGenerator } from './QRGenerator.js';

// Blue noise dithering for QR codes
export { generateBlueNoiseDithered, defaultBrowserCanvasFactory as blueNoiseCanvasFactory } from './internal/blue-noise.js';
