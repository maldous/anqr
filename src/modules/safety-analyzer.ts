/**
 * Safety Analyzer Module
 * Re-exports safety analysis functionality from qr-analyzer module
 */

import {
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

// Re-export types
export type {
  AnalysisIssue,
  AnalysisResult,
  AnalysisWarning,
  ContrastReport,
  SafetyMode,
  SafetyOptions,
  ScanSimulationResult,
};

// Re-export functions and namespace
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
};

export default SafetyAnalyzer;
