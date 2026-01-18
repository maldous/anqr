/**
 * QR Analyzer Module
 * Provides QR code analysis, scanning, validation, and safety checking
 */

// Types (canonical source)
export type {
  ContentType,
  ContentTypeDetails,
  DataCapacity,
  DetectedColors,
  ECCLevel,
  ErrorType,
  ImageProperties,
  QRAnalysisResult,
  QuietZoneInfo,
  StructuralAnalysis,
} from './types';

// Content detection (from content-detection.ts)
export { detectContentType as detectContentTypeDetails } from './content-detection';

// Content analysis utilities (from content/content.ts)
export {
  averageColor,
  calculateContrastRatio,
  calculateImageProperties,
  detectContentType,
  extractDominantColors,
  parseUrlDetails,
  rgbToHex,
  type ColorInfo,
  type ContentAnalysis,
  type ContentType as ContentTypeSimple,
  type DominantColor,
  type ImageProperties as ContentImageProperties,
  type UrlDetails,
} from './content/content';

// Main decoder
export { decodeQRFromCanvas } from './decoder';

// Scanner (from internal module)
export {
  scanCanvas,
  scanFile,
  scanImageData,
  validateQRCode,
  validateQRCodeRobust,
  validateFrames,
  QRScanner,
  type QRLocation,
  type ScanResult,
  type ValidationResult,
} from './internal/scanner';

// Safety analyzer (from internal module)
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
  type AnalysisIssue,
  type AnalysisResult,
  type AnalysisWarning,
  type SafetyMode,
  type SafetyOptions,
  type ScanSimulationResult,
} from './internal/safety';

// Telemetry and statistics
export {
  type ContrastReport,
  calculateContrastStats,
  checkContrastCompliance,
} from './telemetry/contrast';

export {
  type ScanStats,
  type LogEntry,
  type ScanLogger,
  createScanLogger,
} from './telemetry/logging';

export {
  type AnalysisStats,
  calculateAnalysisStats,
  aggregateStats,
} from './telemetry/stats';

// High-level analysis functions
export {
  analyzeQRCode,
  analyzeQRFromCanvas,
  analyzeQRFromFile,
  analyzeQRFromUrl,
} from './analyzer';
