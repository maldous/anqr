/**
 * Safety Analyzer Module
 * Provides QA tools, contrast checking, scan simulation, and readability analysis
 */

import { getContrastRatio, parseColor } from '../../color-utils';
import { isFinderPattern, type ECCLevel } from '../../qr-spec';

// ============================================
// TYPES
// ============================================

export type SafetyMode = 'off' | 'balanced' | 'strict';

export interface SafetyOptions {
  mode: SafetyMode;
  minModulePx: number;
  minQuietZoneModules: number;
  lockFinders: boolean;
  lockTiming: boolean;
  lockAlign: boolean;
  lockFormat: boolean;
  lockVersion: boolean;
  maxOverlayIntensityByEcc: Record<ECCLevel, number>;
}

export interface AnalysisResult {
  score: number; // 0-100
  issues: AnalysisIssue[];
  warnings: AnalysisWarning[];
  recommendations: string[];
}

export interface AnalysisIssue {
  type: 'critical' | 'error';
  message: string;
  location?: { row: number; col: number };
}

export interface AnalysisWarning {
  type: 'warning' | 'info';
  message: string;
  suggestion?: string;
}

export interface ContrastReport {
  overallRatio: number;
  finderContrast: number;
  dataContrast: number;
  meetsWCAG_AA: boolean;
  meetsWCAG_AAA: boolean;
  problematicAreas: Array<{ row: number; col: number; ratio: number }>;
}

export interface ScanSimulationResult {
  success: boolean;
  confidence: number; // 0-100
  simulatedConditions: string;
  issues: string[];
}

// ============================================
// CONTRAST ANALYSIS
// ============================================

/**
 * Analyze contrast between foreground and background
 */
export function analyzeContrast(fgColor: string, bgColor: string): ContrastReport {
  const ratio = getContrastRatio(fgColor, bgColor);

  return {
    overallRatio: ratio,
    finderContrast: ratio, // Same for uniform colors
    dataContrast: ratio,
    meetsWCAG_AA: ratio >= 4.5,
    meetsWCAG_AAA: ratio >= 7,
    problematicAreas: [],
  };
}

/**
 * Analyze contrast for a colored QR matrix
 */
export function analyzeMatrixContrast(
  colors: Array<Array<{ r: number; g: number; b: number }>>,
  bgColor: string,
  moduleCount: number
): ContrastReport {
  const bg = parseColor(bgColor);
  const problematicAreas: Array<{ row: number; col: number; ratio: number }> = [];

  let totalRatio = 0;
  let finderRatioSum = 0;
  let finderCount = 0;
  let dataRatioSum = 0;
  let dataCount = 0;

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      const color = colors[row]?.[col];
      if (!color) continue;

      const ratio = getContrastRatio(color, bg);
      totalRatio += ratio;

      if (isFinderPattern(row, col, moduleCount)) {
        finderRatioSum += ratio;
        finderCount++;
      } else {
        dataRatioSum += ratio;
        dataCount++;
      }

      if (ratio < 3) {
        problematicAreas.push({ row, col, ratio });
      }
    }
  }

  const avgRatio = totalRatio / (moduleCount * moduleCount);
  const finderContrast = finderCount > 0 ? finderRatioSum / finderCount : avgRatio;
  const dataContrast = dataCount > 0 ? dataRatioSum / dataCount : avgRatio;

  return {
    overallRatio: avgRatio,
    finderContrast,
    dataContrast,
    meetsWCAG_AA: avgRatio >= 4.5,
    meetsWCAG_AAA: avgRatio >= 7,
    problematicAreas: problematicAreas.slice(0, 50), // Limit to 50 worst areas
  };
}

// ============================================
// MODULE SIZE VALIDATION
// ============================================

/**
 * Check if module size is adequate for scanning
 */
export function validateModuleSize(
  _modulePx: number,
  outputWidth: number,
  moduleCount: number
): { valid: boolean; actualSize: number; recommendation: string } {
  const actualSize = outputWidth / moduleCount;
  const valid = actualSize >= 2; // Minimum 2px per module for reliable scanning

  let recommendation = '';
  if (!valid) {
    recommendation = `Module size (${actualSize.toFixed(1)}px) is too small. Increase output size or use a lower QR version.`;
  } else if (actualSize < 4) {
    recommendation = `Module size (${actualSize.toFixed(1)}px) is acceptable but larger would improve scanning reliability.`;
  }

  return { valid, actualSize, recommendation };
}

/**
 * Check quiet zone adequacy
 */
export function validateQuietZone(
  marginModules: number,
  minRequired: number = 4
): { valid: boolean; message: string } {
  const valid = marginModules >= minRequired;
  const message = valid
    ? `Quiet zone (${marginModules} modules) meets minimum requirement (${minRequired}).`
    : `Quiet zone (${marginModules} modules) is below minimum (${minRequired}). This may affect scanning.`;

  return { valid, message };
}

// ============================================
// OVERLAY INTENSITY VALIDATION
// ============================================

/**
 * Calculate safe overlay intensity based on ECC level
 */
const DEFAULT_MAX_BY_ECC: Record<ECCLevel, number> = { L: 30, M: 50, Q: 70, H: 85 };

export function calculateSafeIntensity(
  ecc: ECCLevel,
  maxByEcc: Record<ECCLevel, number> = DEFAULT_MAX_BY_ECC
): number {
  return maxByEcc[ecc] || 50;
}

/**
 * Validate overlay intensity for given ECC level
 */
export function validateOverlayIntensity(
  intensity: number,
  ecc: ECCLevel,
  maxByEcc: Record<ECCLevel, number>
): { valid: boolean; message: string; recommendedMax: number } {
  const recommendedMax = maxByEcc[ecc];
  const valid = intensity <= recommendedMax;

  const message = valid
    ? `Overlay intensity (${intensity}%) is within safe range for ECC ${ecc}.`
    : `Overlay intensity (${intensity}%) exceeds recommended maximum (${recommendedMax}%) for ECC ${ecc}. This may affect scanning reliability.`;

  return { valid, message, recommendedMax };
}

// ============================================
// SCAN SIMULATION
// ============================================

/**
 * Simulate scanning under various conditions
 */
export function simulateScan(
  _canvas: HTMLCanvasElement,
  conditions: {
    blur?: number;
    noise?: number;
    rotation?: number;
    brightness?: number;
  } = {}
): ScanSimulationResult {
  const issues: string[] = [];
  let confidence = 100;

  // Simulate blur effect on readability
  if (conditions.blur && conditions.blur > 0) {
    if (conditions.blur > 3) {
      issues.push('High blur level may prevent scanning');
      confidence -= 30;
    } else if (conditions.blur > 1) {
      issues.push('Moderate blur may affect scanning in poor conditions');
      confidence -= 15;
    }
  }

  // Simulate noise effect
  if (conditions.noise && conditions.noise > 0) {
    if (conditions.noise > 20) {
      issues.push('High noise level significantly reduces readability');
      confidence -= 25;
    } else if (conditions.noise > 10) {
      issues.push('Noise may affect scanning reliability');
      confidence -= 10;
    }
  }

  // Simulate rotation effect
  if (conditions.rotation && Math.abs(conditions.rotation) > 0) {
    if (Math.abs(conditions.rotation) > 30) {
      issues.push('Extreme rotation may cause scanning failures');
      confidence -= 20;
    } else if (Math.abs(conditions.rotation) > 15) {
      issues.push('High rotation angle may affect some scanners');
      confidence -= 10;
    }
  }

  // Simulate brightness issues
  if (conditions.brightness !== undefined) {
    if (conditions.brightness < -50 || conditions.brightness > 50) {
      issues.push('Extreme brightness adjustment reduces contrast');
      confidence -= 20;
    }
  }

  return {
    success: confidence > 50,
    confidence: Math.max(0, confidence),
    simulatedConditions:
      Object.entries(conditions)
        .filter(([_, v]) => v !== undefined && v !== 0)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ') || 'optimal',
    issues,
  };
}

/**
 * Apply blur simulation to canvas
 */
export function applyBlurSimulation(canvas: HTMLCanvasElement, blurPx: number): HTMLCanvasElement {
  const result = document.createElement('canvas');
  result.width = canvas.width;
  result.height = canvas.height;
  const ctx = result.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  ctx.filter = `blur(${blurPx}px)`;
  ctx.drawImage(canvas, 0, 0);
  ctx.filter = 'none';

  return result;
}

/**
 * Apply noise simulation to canvas
 */
export function applyNoiseSimulation(
  canvas: HTMLCanvasElement,
  noiseLevel: number,
  seed: number = 0
): HTMLCanvasElement {
  const result = document.createElement('canvas');
  result.width = canvas.width;
  result.height = canvas.height;
  const ctx = result.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  ctx.drawImage(canvas, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Simple seeded random
  let state = seed || Date.now();
  const random = () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };

  for (let i = 0; i < data.length; i += 4) {
    const noise = (random() - 0.5) * noiseLevel * 2.55;
    data[i] = Math.max(0, Math.min(255, data[i] + noise));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
  }

  ctx.putImageData(imageData, 0, 0);
  return result;
}

// ============================================
// COMPREHENSIVE ANALYSIS
// ============================================

/**
 * Perform comprehensive QR code analysis
 */
const DEFAULT_ANALYZE_OPTIONS: {
  fgColor?: string;
  bgColor?: string;
  modulePx?: number;
  outputWidth?: number;
  marginModules?: number;
  overlayIntensity?: number;
  ecc?: ECCLevel;
  safetyMode?: SafetyMode;
} = {};

export function analyzeQR(matrix: boolean[][], options = DEFAULT_ANALYZE_OPTIONS): AnalysisResult {
  const issues: AnalysisIssue[] = [];
  const warnings: AnalysisWarning[] = [];
  const recommendations: string[] = [];
  let score = 100;

  const moduleCount = matrix.length;
  const fgColor = options.fgColor || '#000000';
  const bgColor = options.bgColor || '#ffffff';

  // Check contrast
  const contrast = analyzeContrast(fgColor, bgColor);
  if (contrast.overallRatio < 3) {
    issues.push({
      type: 'critical',
      message: `Contrast ratio (${contrast.overallRatio.toFixed(1)}) is critically low`,
    });
    score -= 30;
  } else if (contrast.overallRatio < 4.5) {
    warnings.push({
      type: 'warning',
      message: `Contrast ratio (${contrast.overallRatio.toFixed(1)}) may cause scanning issues`,
      suggestion: 'Increase contrast between foreground and background colors',
    });
    score -= 15;
  }

  // Check module size
  if (options.modulePx && options.outputWidth) {
    const sizeCheck = validateModuleSize(options.modulePx, options.outputWidth, moduleCount);
    if (!sizeCheck.valid) {
      issues.push({
        type: 'error',
        message: sizeCheck.recommendation,
      });
      score -= 20;
    } else if (sizeCheck.actualSize < 4) {
      warnings.push({
        type: 'info',
        message: sizeCheck.recommendation,
      });
      score -= 5;
    }
  }

  // Check quiet zone
  if (options.marginModules !== undefined) {
    const quietZone = validateQuietZone(options.marginModules);
    if (!quietZone.valid) {
      warnings.push({
        type: 'warning',
        message: quietZone.message,
        suggestion: 'Increase margin to at least 4 modules',
      });
      score -= 10;
    }
  }

  // Check overlay intensity
  if (options.overlayIntensity !== undefined && options.ecc) {
    const intensityCheck = validateOverlayIntensity(options.overlayIntensity, options.ecc, {
      L: 30,
      M: 50,
      Q: 70,
      H: 85,
    });
    if (!intensityCheck.valid) {
      warnings.push({
        type: 'warning',
        message: intensityCheck.message,
        suggestion: `Reduce intensity to ${intensityCheck.recommendedMax}% or increase ECC level`,
      });
      score -= 15;
    }
  }

  // Generate recommendations
  if (score < 100) {
    if (!contrast.meetsWCAG_AA) {
      recommendations.push('Use higher contrast colors (black on white is safest)');
    }
    if (options.ecc && options.ecc !== 'H') {
      recommendations.push('Consider using ECC level H for maximum error correction');
    }
    recommendations.push('Test scanning with multiple devices before deployment');
  }

  return {
    score: Math.max(0, score),
    issues,
    warnings,
    recommendations,
  };
}

// ============================================
// HEATMAP GENERATION
// ============================================

/**
 * Generate a readability heatmap
 */
export function generateReadabilityHeatmap(
  matrix: boolean[][],
  colors: Array<Array<{ r: number; g: number; b: number }>> | null,
  bgColor: string
): HTMLCanvasElement {
  const moduleCount = matrix.length;
  const canvas = document.createElement('canvas');
  canvas.width = moduleCount;
  canvas.height = moduleCount;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  const bg = parseColor(bgColor);

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      const isDark = matrix[row][col];
      let heatValue: number;

      if (colors?.[row]?.[col]) {
        const color = colors[row][col];
        const ratio = getContrastRatio(color, bg);
        heatValue = Math.min(1, ratio / 7); // Normalize to 0-1 (7:1 is AAA)
      } else {
        heatValue = isDark ? 1 : 0.9; // Default black/white has good contrast
      }

      // Finder patterns are most critical
      if (isFinderPattern(row, col, moduleCount)) {
        heatValue = Math.min(1, heatValue * 1.2);
      }

      // Color: green (good) to red (bad)
      const r = Math.round((1 - heatValue) * 255);
      const g = Math.round(heatValue * 255);
      ctx.fillStyle = `rgb(${r},${g},0)`;
      ctx.fillRect(col, row, 1, 1);
    }
  }

  return canvas;
}

// ============================================
// EXPORT
// ============================================

export const SafetyAnalyzer = {
  // Contrast
  analyzeContrast,
  analyzeMatrixContrast,

  // Validation
  validateModuleSize,
  validateQuietZone,
  validateOverlayIntensity,
  calculateSafeIntensity,

  // Simulation
  simulateScan,
  applyBlurSimulation,
  applyNoiseSimulation,

  // Analysis
  analyzeQR,
  generateReadabilityHeatmap,
};

export default SafetyAnalyzer;
