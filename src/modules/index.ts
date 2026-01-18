/**
 * ANQR Modules Index
 *
 * Consolidated exports for all QR code generation functionality
 * organized by feature section from anqr-features.txt
 */

export type {
  ECCLevel,
  EncodingMode,
  MaskPattern,
  QRInstance,
  QRMatrix,
  QROptions,
} from './qr-core';
// ============================================
// QR ENCODING (QREncodingSection)
// ============================================
export {
  calculateOptimalVersion,
  createQRInstance,
  default as QRCoreDefault,
  generateQR,
  getAlignmentPositions,
  getModuleCountForVersion,
  getVersionFromModuleCount,
  isAlignmentPattern,
  isData,
  isFinderPattern,
  isLocked,
  isStructuralModule,
  isTimingPattern,
  QRCore,
} from './qr-core';

// ============================================
// RENDERING (RenderSection)
// ============================================
// NOTE: renderer.ts was removed as dead code - QRGenerator in qr-generator.js handles all rendering
// For QR rendering, use: import { QRGenerator } from './qr-generator'

export type {
  AnimationFrame,
  AnimationOptions,
  AnimationPattern,
  AnimationState,
  GifCompositor,
} from './animation';
// ============================================
// ANIMATION (AnimationSection)
// ============================================
export {
  Animation,
  advanceAnimation,
  applyAnimationPattern,
  applyColorCycle,
  applyTemporalDither,
  calculateCompositorFps,
  // Legacy utilities
  calculateSourceFps,
  createAnimationLoop,
  createAnimationState,
  // GIF compositor (optimal patch-only decode)
  createGifCompositor,
  decimateCompositorFrames,
  decimateFramesToFps,
  default as AnimationDefault,
  getGifDelays,
  getNextFrame,
  interpolateFrames,
  parseGifFrames,
} from './animation';
export type {
  BlueNoiseOptions,
  BlueNoiseResult,
  ColorMode as BlueNoiseColorMode,
} from './qr-generator/internal/blue-noise';
export { generateBlueNoiseDithered } from './qr-generator/';
export type { GradientConfig, HSL, HSLA, RGB, RGBA } from './color-utils';
// Color utilities (canonical source for color types)
export {
  adjustForContrast,
  alphaBlend,
  blendColors,
  blendRgb,
  ColorUtils,
  createCssGradient,
  default as ColorUtilsDefault,
  getAnalogous,
  getComplementary,
  getContrastRatio,
  getGradientColor,
  getGradientColorAt,
  getRelativeLuminance,
  getTextColor,
  getTriadic,
  hslToRgb,
  isDark,
  meetsContrastAA,
  meetsContrastAAA,
  multiplyBlend,
  overlayBlend,
  parseColor,
  parseHex,
  parseHexAlpha,
  parseHslString,
  parseRgbString,
  rgbaToHex,
  rgbaToString,
  rgbToGray,
  rgbToHex,
  rgbToHsl,
  rgbToString,
  screenBlend,
} from './color-utils';
// ============================================
// UI HELPERS
// ============================================
export { CropHandler } from './overlay';
export type { DitherOptions, DitherResult } from './dither-algorithms/';
export {
  applyDither,
  bayerDither,
  blueNoiseDither,
  DitherAlgorithms,
  errorDiffusion,
  gaussianNoiseDither,
  imageDataToFloat,
  orderedDither,
  temporalBlueNoiseDither,
  triangularNoiseDither,
  whiteNoiseDither,
} from './dither-algorithms/';
export { DitherAlgorithms as DitherAlgorithmsDefault } from './dither-algorithms/';
export type { ExportConfig, ExportResult, OutputFormat } from './exporter/';
// ============================================
// OUTPUT & EXPORT (OutputSection)
// ============================================
export {
  canvasToBlob as exporterCanvasToBlob,
  downloadGif,
  downloadImage,
  downloadSvg,
  downloadUrl,
  Exporter,
  ExporterModule,
  exportGif,
  exportImage,
  exportSvg,
  exportVectorSvg,
} from './exporter/';
export { Exporter as ExporterDefault } from './exporter/';
export type { FilterOptions } from './overlay';
export {
  applyColorMode,
  applyFilters,
  blur,
  brightness,
  cannyEdge,
  clamp,
  clamp01,
  contrast,
  convolve,
  copyImageData,
  duotone,
  emboss,
  gamma,
  gaussianBlur,
  getBrightnessMap,
  getRGBMap,
  grayscale,
  hueRotate,
  ImageFilters,
  invert,
  posterize,
  saturation,
  sharpen,
  sobelEdge,
  threshold,
} from './overlay';
export { ImageFilters as ImageFiltersDefault } from './overlay';
export type { OverlayOptions, ProcessedOverlay } from './overlay';
// ============================================
// OVERLAY & DITHERING (OverlaySection)
// ============================================
export {
  applyOverlayMode,
  cropImage,
  fitImage,
  flipCanvas,
  getOverlayData,
  getOverlayRGBData,
  loadImageFromDataUrl,
  loadImageFromFile,
  loadImageFromUrl,
  OverlayProcessor,
  processOverlay,
  rotateCanvas,
} from './overlay';
export { OverlayProcessor as OverlayProcessorDefault } from './overlay';
export type {
  BizCardParams,
  EPCSepaParams,
  GS1DigitalLinkParams,
  OTPAuthParams,
  PayNowParams,
  PIXParams,
  PromptPayParams,
  UPIParams,
} from './payload-generators/';
// ============================================
// PAYLOAD GENERATION (PayloadSection)
// ============================================
export {
  generateAppDeepLink,
  generateBizCard,
  generateCalendarSubscription,
  generateCrypto,
  generateEmail,
  generateEPCSepa,
  generateEvent,
  generateGeo,
  generateGS1DigitalLink,
  generateMeCard,
  generateMessagingLink,
  generateOTPAuth,
  generatePayNow,
  generatePIX,
  generatePromptPay,
  generateSms,
  generateSocialProfile,
  generateTel,
  generateUPI,
  generateUrl,
  generateVCard,
  generateWifi,
  PayloadGenerators,
} from './payload-generators/';
export { PayloadGenerators as PayloadGeneratorsDefault } from './payload-generators/';
// ============================================
// MAIN QR GENERATOR (Orchestrator)
// ============================================
export { QRGenerator } from './qr-generator/';
export type { QRLocation, ScanResult, ValidationResult } from './qr-analyzer';
// ============================================
// QR SCANNER / VALIDATOR
// ============================================
export {
  QRScanner,
  scanCanvas,
  scanFile,
  scanImageData,
  validateFrames,
  validateQRCode,
  validateQRCodeRobust,
} from './qr-analyzer';
export { QRScanner as QRScannerDefault } from './qr-analyzer';
export type {
  AnalysisIssue,
  AnalysisResult,
  AnalysisWarning,
  ContrastReport,
  SafetyMode,
  SafetyOptions,
  ScanSimulationResult,
} from './qr-analyzer';
// ============================================
// SAFETY & QA (SafetySection)
// ============================================
export {
  analyzeContrast,
  analyzeMatrixContrast,
  analyzeQR,
  applyBlurSimulation,
  applyNoiseSimulation,
  calculateSafeIntensity,
  generateReadabilityHeatmap,
  SafetyAnalyzer,
  simulateScan,
  validateModuleSize,
  validateOverlayIntensity,
  validateQuietZone,
} from './qr-analyzer';
export { SafetyAnalyzer as SafetyAnalyzerDefault } from './qr-analyzer';
export type { EmbedOptions, ShareConfig } from './share-utils/';
// ============================================
// SHARE & EMBED (ShareSection)
// ============================================
export {
  buildUrlParams,
  canvasToBlob,
  canvasToDataUrl,
  copyImageToClipboard,
  copyToClipboard,
  downloadBlob,
  estimateQRSize,
  generateBBCodeEmbed,
  generateIframeEmbed,
  generateImageEmbed,
  generateMarkdownEmbed,
  getShareableUrl,
  getSocialShareUrls,
  parseUrlParams,
  ShareUtils,
  updateBrowserUrl,
} from './share-utils/';
export { ShareUtils as ShareUtilsDefault } from './share-utils/';
export type {
  WatermarkBlend,
  WatermarkKind,
  WatermarkOptions,
  WatermarkPosition,
  WatermarkResult,
} from './overlay';
// ============================================
// WATERMARK (WatermarkSection)
// ============================================
export {
  applyBlendMode,
  applyCenterLogo,
  applyWatermark,
  createPatternWatermark,
  createTextWatermark,
  getWatermarkPositions,
  Watermark,
} from './overlay';
export { Watermark as WatermarkDefault } from './overlay';
