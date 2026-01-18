/**
 * QR Analyzer Module
 * Re-exports QR analysis functionality from qr-analyzer/ subdirectory
 */

export {
  // Types
  type ContentType,
  type ContentTypeDetails,
  type DataCapacity,
  type DetectedColors,
  type ECCLevel,
  type ErrorType,
  type ImageProperties,
  type QRAnalysisResult,
  type QuietZoneInfo,
  type StructuralAnalysis,
  
  // Content analysis
  averageColor,
  calculateContrastRatio,
  calculateImageProperties,
  detectContentType,
  extractDominantColors,
  parseUrlDetails,
  rgbToHex,
  type ColorInfo,
  type ContentAnalysis,
  type DominantColor,
  type UrlDetails,
  
  // Telemetry
  type ContrastReport,
  calculateContrastStats,
  checkContrastCompliance,
  type ScanStats,
  type LogEntry,
  createScanLogger,
  type AnalysisStats,
  calculateAnalysisStats,
  aggregateStats,
  
  // Scanner
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
  
  // Safety analyzer
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
  
  // Main analyzer
  analyzeQRCode,
  analyzeQRFromCanvas,
  analyzeQRFromFile,
  analyzeQRFromUrl,
} from './qr-analyzer/';
