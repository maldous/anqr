/**
 * Safety Analyzer Module
 * @deprecated Import from './qr-analyzer' instead
 *
 * Provides QA tools, contrast checking, scan simulation, and readability analysis
 */

import {
  analyzeContrast,
  analyzeMatrixContrast,
  validateModuleSize,
  validateQuietZone,
  validateOverlayIntensity,
  calculateSafeIntensity,
  simulateScan,
  applyBlurSimulation,
  applyNoiseSimulation,
  analyzeQR,
  generateReadabilityHeatmap,
  SafetyAnalyzer,
  type SafetyMode,
  type SafetyOptions,
  type AnalysisResult,
  type AnalysisIssue,
  type AnalysisWarning,
  type ContrastReport,
  type ScanSimulationResult,
} from './qr-analyzer/internal/safety';

// Re-export everything
export {
  analyzeContrast,
  analyzeMatrixContrast,
  validateModuleSize,
  validateQuietZone,
  validateOverlayIntensity,
  calculateSafeIntensity,
  simulateScan,
  applyBlurSimulation,
  applyNoiseSimulation,
  analyzeQR,
  generateReadabilityHeatmap,
  SafetyAnalyzer,
  type SafetyMode,
  type SafetyOptions,
  type AnalysisResult,
  type AnalysisIssue,
  type AnalysisWarning,
  type ContrastReport,
  type ScanSimulationResult,
};

export default SafetyAnalyzer;
