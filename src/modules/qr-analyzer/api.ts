/**
 * QR Analyzer Module - Public API Manifest
 *
 * This file documents all public exports from the qr-analyzer module.
 * Used by CI to check for API drift against index.ts exports.
 */

import { createLogger } from '../../lib/logger';

const _log = createLogger('ANALYZER');

// High-level analysis
export const ANALYSIS_API = [
  'analyzeQRCode',
  'analyzeQRFromCanvas',
  'analyzeQRFromFile',
  'analyzeQRFromUrl',
  'buildAnalysisExportData',
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

// Note: Logger utilities (enableLogBuffer, disableLogBuffer, flushLogBuffer) are
// available from '@/lib/logger' directly - they are not part of the qr-analyzer public API.

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

// Telemetry - Contrast
export const TELEMETRY_CONTRAST_API = [
  'calculateContrastStats',
  'checkContrastCompliance',
] as const;

// Telemetry - Logging
export const TELEMETRY_LOGGING_API = ['createScanLogger'] as const;

// Telemetry - Stats
export const TELEMETRY_STATS_API = ['aggregateStats', 'calculateAnalysisStats'] as const;

// Types (Logger types now come from central @/lib/logger)
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
  'GeometryDiagnostics',
  'ImageProperties',
  'LogEntry',
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
  ...TELEMETRY_CONTRAST_API,
  ...TELEMETRY_LOGGING_API,
  ...TELEMETRY_STATS_API,
] as const;
