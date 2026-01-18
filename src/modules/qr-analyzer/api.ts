/**
 * QR Analyzer Module - Public API Manifest
 *
 * This file documents all public exports from the qr-analyzer module.
 * Used by CI to check for API drift against index.ts exports.
 */

// High-level analysis
export const ANALYSIS_API = [
  'analyzeQRCode',
  'analyzeQRFromCanvas',
  'analyzeQRFromFile',
  'analyzeQRFromUrl',
] as const;

// Content analysis
export const CONTENT_API = [
  'averageColor',
  'calculateContrastRatio',
  'calculateImageProperties',
  'detectContentType',
  'detectContentTypeDetails',
  'extractDominantColors',
  'parseUrlDetails',
  'rgbToHex',
] as const;

// Decoding
export const DECODER_API = ['decodeQRFromCanvas'] as const;

// Safety analysis
export const SAFETY_API = [
  'analyzeQR',
  'analyzeContrast',
  'analyzeMatrixContrast',
  'applyBlurSimulation',
  'applyNoiseSimulation',
  'calculateSafeIntensity',
  'generateReadabilityHeatmap',
  'simulateScan',
  'validateModuleSize',
  'validateOverlayIntensity',
  'validateQuietZone',
  'SafetyAnalyzer',
] as const;

// Scanner
export const SCANNER_API = [
  'scanCanvas',
  'scanFile',
  'scanImageData',
  'validateFrames',
  'validateQRCode',
  'validateQRCodeRobust',
  'QRScanner',
] as const;

// Logger
export const LOGGER_API = ['createLogger', 'qrAnalyzerLog', 'qrDecoderLog'] as const;

// Telemetry - Contrast
export const TELEMETRY_CONTRAST_API = [
  'calculateContrastStats',
  'checkContrastCompliance',
] as const;

// Telemetry - Logging
export const TELEMETRY_LOGGING_API = ['createScanLogger'] as const;

// Telemetry - Stats
export const TELEMETRY_STATS_API = ['aggregateStats', 'calculateAnalysisStats'] as const;

// Types
export const TYPES = [
  'AnalysisIssue',
  'AnalysisResult',
  'AnalysisStats',
  'AnalysisWarning',
  'ColorInfo',
  'ContentAnalysis',
  'ContentImageProperties',
  'ContentType',
  'ContentTypeDetails',
  'ContentTypeSimple',
  'ContrastReport',
  'DataCapacity',
  'DetectedColors',
  'DominantColor',
  'ECCLevel',
  'ErrorType',
  'ImageProperties',
  'LogData',
  'LogEntry',
  'Logger',
  'QRAnalysisResult',
  'QRLocation',
  'QuietZoneInfo',
  'SafetyMode',
  'SafetyOptions',
  'ScanLogger',
  'ScanResult',
  'ScanSimulationResult',
  'ScanStats',
  'StructuralAnalysis',
  'UrlDetails',
  'ValidationResult',
] as const;

// All public exports
export const PUBLIC_API = [
  ...ANALYSIS_API,
  ...CONTENT_API,
  ...DECODER_API,
  ...SAFETY_API,
  ...SCANNER_API,
  ...LOGGER_API,
  ...TELEMETRY_CONTRAST_API,
  ...TELEMETRY_LOGGING_API,
  ...TELEMETRY_STATS_API,
] as const;
