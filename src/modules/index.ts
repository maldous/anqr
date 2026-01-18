/**
 * ANQR Modules Index
 *
 * Root barrel file that re-exports all module entrypoints.
 * Per RULES.txt: Only re-exports module entrypoints, never deep paths.
 * 
 * NOTE: This file exists for convenience but consumers should prefer
 * importing directly from specific modules to avoid name collisions.
 * 
 * Due to symbol conflicts between modules, we use selective exports.
 * For full access to any module's API, import from that module directly.
 */

// ============================================
// CORE (canonical source for color utilities)
// ============================================
export {
  // Types
  type RGB,
  type RGBA,
  type HSL,
  type HSLA,
  type GradientStop,
  type GradientType,
  type GradientConfig,
  // Math
  clamp,
  clamp01,
  createSeededRandom,
  createRNG,
  lerp,
  seededRandom,
  // Color parsing
  parseHex,
  parseHexAlpha,
  parseRgbString,
  parseHslString,
  parseColor,
  // Color conversion
  rgbToHex,
  rgbaToHex,
  rgbToString,
  rgbaToString,
  rgbToGray,
  rgbToHsl,
  hslToRgb,
  hslToRgbTuple,
  rgbToHslTuple,
  // Blending
  blendRgb,
  blendColors,
  alphaBlend,
  multiplyBlend,
  screenBlend,
  overlayBlend,
  // Contrast
  getRelativeLuminance,
  getContrastRatio,
  isDark,
  getTextColor,
  meetsContrastAA,
  meetsContrastAAA,
  adjustForContrast,
  // Gradients
  getGradientColor,
  getGradientColorAt,
  createCssGradient,
  // Color harmony
  getComplementary,
  getAnalogous,
  getTriadic,
} from './core';

// ============================================
// BROWSER I/O (canonical source for canvas/download)
// ============================================
export {
  canvasToBlob,
  canvasToDataUrl,
  downloadBlob,
  downloadUrl,
  saveFileNative,
} from './browser-io';

// ============================================
// BROWSER CLIPBOARD (canonical source for clipboard)
// ============================================
export {
  copyToClipboard,
  copyImageToClipboard,
} from './browser-clipboard';

// ============================================
// QR ENCODER (canonical source for QR encoding)
// ============================================
export {
  // Main encoder
  qrcode,
  // Types
  QRMode,
  QRErrorCorrectionLevel,
  QRMaskPattern,
  type QRModeType,
  type QRErrorCorrectionLevelType,
  type QRErrorCorrectionLevelChar,
  type QRMaskPatternType,
  type QRCodeInstance,
  type QRDataSegment,
  type QRBitBuffer,
  type RSBlock,
  type QRPolynomial,
  // String encoding
  stringToBytes,
  stringToBytesFn,
  setStringToBytes,
  resetStringToBytes,
  createStringToBytes,
  // Low-level APIs
  qrBitBuffer,
  qrNumber,
  qrAlphaNum,
  qr8BitByte,
  qrKanji,
  QRMath,
  qrPolynomial,
  glog,
  gexp,
  QRRSBlock,
  getRSBlocks,
  QRUtil,
  getBCHTypeInfo,
  getBCHTypeNumber,
  getPatternPosition,
  getMaskFunction,
  getErrorCorrectPolynomial,
  getLengthInBits,
  getLostPoint,
  byteArrayOutputStream,
  base64EncodeOutputStream,
  gifImage,
  createDataURL,
  // Shift-JIS
  createShiftJISEncoder,
  canEncodeAsShiftJIS,
  // QR Core compat
  createQRInstance,
  generateQR,
  calculateOptimalVersion,
  getCompatibleMode,
  getModuleCountForVersion,
  getVersionFromModuleCount,
  getAlignmentPositions,
  getAlignmentPatternCenters,
  isFinderPattern,
  isTimingPattern,
  isAlignmentPattern,
  isStructuralModule,
  isData,
  isLocked,
  QRCore,
  type ECCLevel,
  type EncodingMode,
  type MaskPattern,
  type QROptions,
  type QRMatrix,
  type QRInstance,
} from './qr-encoder';

// ============================================
// QR SPEC (canonical source for QR domain knowledge)
// ============================================
// Selective exports to avoid conflicts with qr-encoder
// Note: getBCHTypeInfo, getBCHTypeNumber, getMaskFunction are exported from qr-encoder
export {
  // Constants
  ALIGNMENT_POSITIONS,
  getAlignmentPositions as getAlignmentPositionsSpec,
  ECC_CAPACITIES_BYTE,
  ECC_CAPACITIES_NUMERIC,
  ECC_CAPACITIES_ALPHANUMERIC,
  // Pattern detection (unique to qr-spec)
  isFormatInfo,
  isVersionInfo,
  // Mode constants
  MODE_NUMERIC,
  MODE_ALPHANUMERIC,
  MODE_BYTE,
  MODE_KANJI,
  MODE_TERMINATOR,
} from './qr-spec';

// ============================================
// QR DECODER
// ============================================
export * from './qr-decoder';

// ============================================
// QR GENERATOR
// ============================================
export {
  // Main class
  QRGenerator,
  // Cache
  MemoCache,
  alignmentCache,
  canvasHashCache,
  clearQRCaches,
  overlayDataCache,
  qrMatrixCache,
  // Canvas factory
  defaultBrowserCanvasFactory,
  // Utils (exclude getContrastRatio - use from core)
  hashCanvasContent,
  hashString,
  // Drawing
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
  // Filters
  applyBoxBlur,
  applyCannyEdge,
  applyFiltersManual,
  applySharpen,
  applySobelEdge,
  preprocessImageData,
  // Color
  applyPaletteColor,
  applyPerModuleColor,
  darkenColor,
  ensureContrast,
  lightenColor,
  // Dithering
  applyAdvancedDither,
  applyDitherToMatrix,
  applyTrueDither,
  distributeError,
  getDiffusionKernel,
  // Overlay
  applyGeometricTransforms,
  generateSubpixelMatrix,
  getOverlayData,
  getSubpixelOverlayData,
  hasGeometricTransforms,
  hasPreprocessingOptions,
  loadImageDataRGB,
  preprocessOverlay,
  // ECC
  getEccWeight,
  isEccSafeToModify,
  // Pixel matrix
  generatePixelDecisionMatrix,
  getScaleFactor,
  prepareUnifiedOverlayData,
  // Render
  applyOverlayMode,
  renderModules,
  generateScaledQR,
  // Blue noise
  generateBlueNoiseDithered,
  blueNoiseCanvasFactory,
  // Types
  type QRMatrixResult,
  type OverlayData,
  type PixelDecisionResult,
  type QRGeneratorConfig,
  type RGBWithMeta,
  type PixelDecisionMatrix,
  type OverlayModeResult,
  type CreateCanvasFn,
  type CanvasElement,
  type Canvas2DContext,
  type CanvasFactory,
} from './qr-generator';

// ============================================
// QR ANALYZER
// ============================================
export * from './qr-analyzer';

// ============================================
// ANIMATION
// ============================================
export * from './animation';

// ============================================
// DITHERING (selective to avoid RGB conflict)
// ============================================
export {
  applyDither,
  bayerDither,
  orderedDither,
  // Temporal dithering (canonical source)
  calculateTemporalOffset,
  applyTemporalNoiseToCanvas,
  generateTemporalSequence,
  isTemporalDitherActive,
  temporalBlueNoiseDither,
  type TemporalDitherMode,
} from './dither-algorithms';

// ============================================
// OVERLAY
// ============================================
export * from './overlay';

// ============================================
// EXPORTER
// ============================================
export {
  // Types
  type OutputFormat,
  type ExportConfig,
  type ExportResult,
  type PngMetadata,
  type VectorModuleStyle,
  type VectorFinderStyle,
  type VectorAlignmentStyle,
  type VectorTimingStyle,
  type VectorGradient,
  type VectorSvgConfig,
  getDefaultExportConfig,
  // Utils
  escapeXml,
  // PNG
  calculateCrc32,
  createPngPhysChunk,
  embedPngDpi,
  createPngTextChunk,
  embedPngMetadata,
  // Image export
  exportImage,
  downloadImage,
  // GIF
  exportGif,
  downloadGif,
  // SVG
  exportSvg,
  downloadSvg,
  // Vector SVG
  exportVectorSvg,
  downloadVectorSvg,
} from './exporter';

// ============================================
// PAYLOAD GENERATORS
// ============================================
export * from './payload-generators';

// ============================================
// SHARE LINKS (canonical source for URL sharing)
// ============================================
export {
  MAX_SHARE_URL_LENGTH,
  type ShareConfig,
  type EmbedOptions,
  parseUrlParams,
  buildUrlParams,
  updateBrowserUrl,
  getShareableUrl,
  checkShareUrlLength,
  convertToImageApiUrl,
  generateImageEmbed,
  generateIframeEmbed,
  generateMarkdownEmbed,
  generateBBCodeEmbed,
  getSocialShareUrls,
} from './share-links';

// ============================================
// PLATFORM
// ============================================
export * from './platform';
