import { analyzeContrast } from './analyze-contrast';
import { analyzeMatrixContrast } from './analyze-matrix-contrast';
import { analyzeQR } from './analyze-qr';
import { applyBlurSimulation } from './apply-blur-simulation';
import { applyNoiseSimulation } from './apply-noise-simulation';
import { calculateSafeIntensity } from './calculate-safe-intensity';
import { generateReadabilityHeatmap } from './generate-readability-heatmap';
import { simulateScan } from './simulate-scan';
import { validateModuleSize } from './validate-module-size';
import { validateOverlayIntensity } from './validate-overlay-intensity';
import { validateQuietZone } from './validate-quiet-zone';

/**
 * Safety Analyzer namespace
 */
export const SafetyAnalyzer = {
  analyzeContrast,
  analyzeMatrixContrast,
  analyzeQR,
  applyBlurSimulation,
  applyNoiseSimulation,
  calculateSafeIntensity,
  generateReadabilityHeatmap,
  simulateScan,
  validateModuleSize,
  validateOverlayIntensity,
  validateQuietZone,
};
