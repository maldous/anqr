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
// ANIMATION
// ============================================
export * from './animation';
// ============================================
// BROWSER CLIPBOARD (canonical source for clipboard)
// ============================================
export {
  copyImageToClipboard,
  copyToClipboard,
} from './browser-clipboard';
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
// CORE (canonical source for color utilities)
// ============================================
export {
  adjustForContrast,
  alphaBlend,
  blendColors,
  // Blending
  blendRgb,
  // Math
  clamp,
  clamp01,
  createCssGradient,
  createRNG,
  createSeededRandom,
  type GradientConfig,
  type GradientStop,
  type GradientType,
  getAnalogous,
  // Color harmony
  getComplementary,
  getContrastRatio,
  // Gradients
  getGradientColor,
  getGradientColorAt,
  // Contrast
  getRelativeLuminance,
  getTextColor,
  getTriadic,
  type HSL,
  type HSLA,
  hslToRgb,
  hslToRgbTuple,
  isDark,
  lerp,
  meetsContrastAA,
  meetsContrastAAA,
  multiplyBlend,
  overlayBlend,
  parseColor,
  // Color parsing
  parseHex,
  parseHexAlpha,
  parseHslString,
  parseRgbString,
  // Types
  type RGB,
  type RGBA,
  rgbaToHex,
  rgbaToString,
  rgbToGray,
  // Color conversion
  rgbToHex,
  rgbToHsl,
  rgbToHslTuple,
  rgbToString,
  screenBlend,
  seededRandom,
} from './core';
// ============================================
// DITHERING (selective to avoid RGB conflict)
// ============================================
export {
  applyDither,
  applyTemporalNoiseToCanvas,
  bayerDither,
  // Temporal dithering (canonical source)
  calculateTemporalOffset,
  generateTemporalSequence,
  isTemporalDitherActive,
  orderedDither,
  type TemporalDitherMode,
  temporalBlueNoiseDither,
} from './dither-algorithms';
// ============================================
// EXPORTER
// ============================================
export {
  // PNG
  calculateCrc32,
  createPngPhysChunk,
  createPngTextChunk,
  downloadGif,
  downloadImage,
  downloadSvg,
  downloadVectorSvg,
  type ExportConfig,
  type ExportResult,
  embedPngDpi,
  embedPngMetadata,
  // Utils
  escapeXml,
  // GIF
  exportGif,
  // Image export
  exportImage,
  // SVG
  exportSvg,
  // Vector SVG
  exportVectorSvg,
  getDefaultExportConfig,
  // Types
  type OutputFormat,
  type PngMetadata,
  type VectorAlignmentStyle,
  type VectorFinderStyle,
  type VectorGradient,
  type VectorModuleStyle,
  type VectorSvgConfig,
  type VectorTimingStyle,
} from './exporter';
// ============================================
// OVERLAY
// ============================================
export * from './overlay';
// ============================================
// PAYLOAD GENERATORS
// ============================================
export * from './payload-generators';
// ============================================
// PLATFORM
// ============================================
export * from './platform';
// ============================================
// QR ANALYZER
// ============================================
export * from './qr-analyzer';
// ============================================
// QR DECODER
// ============================================
export * from './qr-decoder';
// ============================================
// QR ENCODER (canonical source for QR encoding)
// ============================================
export {
  base64EncodeOutputStream,
  byteArrayOutputStream,
  calculateOptimalVersion,
  canEncodeAsShiftJIS,
  createDataURL,
  // QR encoder utilities
  createQRInstance,
  // Shift-JIS
  createShiftJISEncoder,
  createStringToBytes,
  type ECCLevel,
  type EncodingMode,
  generateQR,
  getAlignmentPatternCenters,
  getAlignmentPositions,
  getBCHTypeInfo,
  getBCHTypeNumber,
  getCompatibleMode,
  getErrorCorrectPolynomial,
  getLengthInBits,
  getLostPoint,
  getMaskFunction,
  getModuleCountForVersion,
  getPatternPosition,
  getRSBlocks,
  getVersionFromModuleCount,
  gexp,
  gifImage,
  glog,
  isAlignmentPattern,
  isData,
  isFinderPattern,
  isLocked,
  isStructuralModule,
  isTimingPattern,
  type MaskPattern,
  type QRBitBuffer,
  type QRCodeInstance,
  type QRDataSegment,
  QRErrorCorrectionLevel,
  type QRErrorCorrectionLevelChar,
  type QRErrorCorrectionLevelType,
  type QRInstance,
  QRMaskPattern,
  type QRMaskPatternType,
  QRMath,
  type QRMatrix,
  // Types
  QRMode,
  type QRModeType,
  type QROptions,
  type QRPolynomial,
  QRRSBlock,
  QRUtil,
  qr8BitByte,
  qrAlphaNum,
  // Low-level APIs
  qrBitBuffer,
  // Main encoder
  qrcode,
  qrKanji,
  qrNumber,
  qrPolynomial,
  type RSBlock,
  resetStringToBytes,
  setStringToBytes,
  // String encoding
  stringToBytes,
  stringToBytesFn,
} from './qr-encoder';
// ============================================
// QR GENERATOR
// ============================================
export {
  alignmentCache,
  // Dithering
  applyAdvancedDither,
  // Filters
  applyBoxBlur,
  applyCannyEdge,
  applyDitherToMatrix,
  applyFiltersManual,
  // Overlay
  applyGeometricTransforms,
  // Color
  applyPaletteColor,
  applyPerModuleColor,
  // Render
  applyQROverlayMode,
  applySharpen,
  applySobelEdge,
  applyTrueDither,
  blueNoiseCanvasFactory,
  type Canvas2DContext,
  type CanvasElement,
  type CanvasFactory,
  type CreateCanvasFn,
  canvasHashCache,
  clearQRCaches,
  // Drawing
  createGradientFill,
  darkenColor,
  // Canvas factory
  defaultBrowserCanvasFactory,
  distributeError,
  drawAlignmentPattern,
  drawCenterLogo,
  drawFinderModule,
  drawFinderPatternComplete,
  drawFrame,
  drawFrameBackground,
  drawHalftoneModule,
  drawModule,
  drawTimingModule,
  ensureContrast,
  // Blue noise
  generateBlueNoiseDithered,
  // Pixel matrix
  generatePixelDecisionMatrix,
  generateScaledQR,
  generateSubpixelMatrix,
  getDiffusionKernel,
  // ECC
  getEccWeight,
  getOverlayData,
  getScaleFactor,
  getSubpixelOverlayData,
  hasGeometricTransforms,
  // Utils (exclude getContrastRatio - use from core)
  hashCanvasContent,
  hashString,
  hasPreprocessingOptions,
  isEccSafeToModify,
  lightenColor,
  loadImageDataRGB,
  // Cache
  MemoCache,
  type OverlayData,
  type OverlayModeResult,
  overlayDataCache,
  type PixelDecisionMatrix,
  type PixelDecisionResult,
  prepareUnifiedOverlayData,
  preprocessImageData,
  preprocessOverlay,
  // Main class
  QRGenerator,
  type QRGeneratorConfig,
  // Types
  type QRMatrixResult,
  qrMatrixCache,
  type RGBWithMeta,
  renderModules,
  roundRect,
} from './qr-generator';
// ============================================
// QR SPEC (canonical source for QR domain knowledge)
// ============================================
// Selective exports to avoid conflicts with qr-encoder
// Note: getBCHTypeInfo, getBCHTypeNumber, getMaskFunction are exported from qr-encoder
export {
  // Constants
  ALIGNMENT_POSITIONS,
  ECC_CAPACITIES_ALPHANUMERIC,
  ECC_CAPACITIES_BYTE,
  ECC_CAPACITIES_NUMERIC,
  getAlignmentPositions as getAlignmentPositionsSpec,
  // Pattern detection (unique to qr-spec)
  isFormatInfo,
  isVersionInfo,
  MODE_ALPHANUMERIC,
  MODE_BYTE,
  MODE_KANJI,
  // Mode constants
  MODE_NUMERIC,
  MODE_TERMINATOR,
} from './qr-spec';
// ============================================
// SHARE LINKS (canonical source for URL sharing)
// ============================================
export {
  buildUrlParams,
  checkShareUrlLength,
  convertToImageApiUrl,
  type EmbedOptions,
  generateBBCodeEmbed,
  generateIframeEmbed,
  generateImageEmbed,
  generateMarkdownEmbed,
  getShareableUrl,
  getSocialShareUrls,
  MAX_SHARE_URL_LENGTH,
  parseUrlParams,
  type ShareConfig,
  updateBrowserUrl,
} from './share-links';
