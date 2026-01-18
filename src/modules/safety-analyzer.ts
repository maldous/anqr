/**
 * Safety Analyzer Module
 * Re-exports safety analysis functionality from qr-analyzer module
 */

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
  type ContrastReport,
  type SafetyMode,
  type SafetyOptions,
  type ScanSimulationResult,
} from './qr-analyzer';

export default SafetyAnalyzer;
