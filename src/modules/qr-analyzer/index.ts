/**
 * QR Analyzer Module
 * Provides QR code analysis, scanning, validation, and safety checking
 */

import { createLogger } from '../../lib/logger';

const _log = createLogger('ANALYZER');

// High-level analysis functions
export {
  analyzeQRCode,
  analyzeQRFromCanvas,
  analyzeQRFromFile,
  analyzeQRFromUrl,
} from './analyzer';
// Content analysis utilities (from analyzer-content.ts)
export {
  averageColor,
  type ColorInfo,
  type ContentAnalysis,
  type ContentType as ContentTypeSimple,
  calculateContrastRatio,
  calculateImageProperties,
  type DominantColor,
  detectContentType,
  extractDominantColors,
  type ImageProperties as ContentImageProperties,
  parseUrlDetails,
  rgbToHex,
  type UrlDetails,
} from './analyzer-content';
// Content detection (from content-detection.ts)
export { detectContentType as detectContentTypeDetails } from './content-detection';
// Main decoder
export { decodeQRFromCanvas } from './decoder';
export { type AnalysisExportData, buildAnalysisExportData } from './export';
// Safety analyzer
export {
  type AnalysisIssue,
  type AnalysisResult,
  type AnalysisWarning,
  analyzeContrast,
  analyzeMatrixContrast,
  analyzeQR,
  applyBlurSimulation,
  applyNoiseSimulation,
  calculateSafeIntensity,
  generateReadabilityHeatmap,
  SafetyAnalyzer,
  type SafetyMode,
  type SafetyOptions,
  type ScanSimulationResult,
  simulateScan,
  validateModuleSize,
  validateOverlayIntensity,
  validateQuietZone,
} from './safety';
// Scanner
export {
  type QRLocation,
  QRScanner,
  type ScanResult,
  scanCanvas,
  scanFile,
  scanImageData,
  type ValidationResult,
  validateFrames,
  validateQRCode,
  validateQRCodeRobust,
} from './scanner';
// Worker-based validation (off main thread)
export { terminateValidationWorker, validateInWorker } from './validation-worker-client';

// Telemetry and statistics
export {
  type ContrastReport,
  calculateContrastStats,
  checkContrastCompliance,
} from './telemetry-contrast';

export {
  createScanLogger,
  type LogEntry,
  type ScanLogger,
  type ScanStats,
} from './telemetry-logging';

export { type AnalysisStats, aggregateStats, calculateAnalysisStats } from './telemetry-stats';
// Types (canonical source)
export type {
  ContentType,
  ContentTypeDetails,
  DataCapacity,
  DecoderMetadata,
  DetectedColors,
  DominantColorInfo,
  ECCLevel,
  ErrorType,
  GeometryDiagnostics,
  ImageProperties,
  QRAnalysisResult,
  QuietZoneInfo,
  StructuralAnalysis,
  TimingDiagnostics,
} from './types';
