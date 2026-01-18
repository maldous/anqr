/**
 * Safety Analyzer Module
 * Provides QA tools, contrast checking, scan simulation, and readability analysis
 */

import { getContrastRatio, parseColor } from '../../core';
import { scanCanvas } from './scanner';

export type SafetyMode = 'off' | 'balanced' | 'strict';

export interface SafetyOptions {
  mode: SafetyMode;
  minModulePx: number;
  minQuietZoneModules: number;
  maxOverlayIntensity: number;
}

export interface ContrastReport {
  ratio: number;
  meetsAA: boolean;
  meetsAAA: boolean;
  fgLuminance: number;
  bgLuminance: number;
}

export interface AnalysisWarning {
  type: 'contrast' | 'module_size' | 'quiet_zone' | 'overlay_intensity' | 'style';
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface AnalysisIssue {
  type: string;
  message: string;
  location?: { x: number; y: number };
}

export interface AnalysisResult {
  valid: boolean;
  scannable: boolean;
  warnings: AnalysisWarning[];
  issues: AnalysisIssue[];
  contrast: ContrastReport | null;
  moduleSize: number | null;
  quietZone: number | null;
}

export interface ScanSimulationResult {
  success: boolean;
  data: string | null;
  confidence: number;
  conditions: string;
}

/**
 * Analyze contrast between foreground and background colors
 */
export function analyzeContrast(fgColor: string, bgColor: string): ContrastReport {
  const fg = parseColor(fgColor);
  const bg = parseColor(bgColor);
  
  if (!fg || !bg) {
    return {
      ratio: 1,
      meetsAA: false,
      meetsAAA: false,
      fgLuminance: 0,
      bgLuminance: 0,
    };
  }
  
  // Calculate luminance using WCAG formula
  const calcLum = (c: { r: number; g: number; b: number }) => {
    const rsRGB = c.r / 255;
    const gsRGB = c.g / 255;
    const bsRGB = c.b / 255;
    const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : ((rsRGB + 0.055) / 1.055) ** 2.4;
    const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : ((gsRGB + 0.055) / 1.055) ** 2.4;
    const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : ((bsRGB + 0.055) / 1.055) ** 2.4;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  
  const fgLuminance = calcLum(fg);
  const bgLuminance = calcLum(bg);
  const ratio = getContrastRatio(fg, bg);
  
  return {
    ratio,
    meetsAA: ratio >= 4.5,
    meetsAAA: ratio >= 7,
    fgLuminance,
    bgLuminance,
  };
}

/**
 * Analyze contrast from a QR matrix
 */
export function analyzeMatrixContrast(
  matrix: boolean[][],
  fgColor: string,
  bgColor: string
): ContrastReport {
  return analyzeContrast(fgColor, bgColor);
}

/**
 * Apply blur simulation to test readability
 */
export function applyBlurSimulation(
  canvas: HTMLCanvasElement,
  blurRadius: number
): HTMLCanvasElement {
  const result = document.createElement('canvas');
  result.width = canvas.width;
  result.height = canvas.height;
  const ctx = result.getContext('2d');
  if (ctx) {
    ctx.filter = `blur(${blurRadius}px)`;
    ctx.drawImage(canvas, 0, 0);
  }
  return result;
}

/**
 * Apply noise simulation to test readability
 */
export function applyNoiseSimulation(
  canvas: HTMLCanvasElement,
  noiseLevel: number
): HTMLCanvasElement {
  const result = document.createElement('canvas');
  result.width = canvas.width;
  result.height = canvas.height;
  const ctx = result.getContext('2d');
  if (!ctx) return canvas;
  
  ctx.drawImage(canvas, 0, 0);
  const imageData = ctx.getImageData(0, 0, result.width, result.height);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * noiseLevel * 255;
    data[i] = Math.max(0, Math.min(255, data[i] + noise));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
  }
  
  ctx.putImageData(imageData, 0, 0);
  return result;
}

/**
 * Calculate safe overlay intensity based on ECC level
 */
export function calculateSafeIntensity(eccLevel: string): number {
  const intensityByEcc: Record<string, number> = {
    L: 30,
    M: 50,
    Q: 70,
    H: 85,
  };
  return intensityByEcc[eccLevel] ?? 50;
}

/**
 * Validate module size for scannability
 */
export function validateModuleSize(
  moduleSize: number,
  minSize = 4
): { valid: boolean; warning?: string } {
  if (moduleSize < minSize) {
    return {
      valid: false,
      warning: `Module size ${moduleSize}px is below minimum ${minSize}px for reliable scanning`,
    };
  }
  return { valid: true };
}

/**
 * Validate quiet zone size
 */
export function validateQuietZone(
  quietZone: number,
  minModules = 4
): { valid: boolean; warning?: string } {
  if (quietZone < minModules) {
    return {
      valid: false,
      warning: `Quiet zone ${quietZone} modules is below minimum ${minModules} modules`,
    };
  }
  return { valid: true };
}

/**
 * Validate overlay intensity
 */
export function validateOverlayIntensity(
  intensity: number,
  eccLevel: string
): { valid: boolean; warning?: string } {
  const maxSafe = calculateSafeIntensity(eccLevel);
  if (intensity > maxSafe) {
    return {
      valid: false,
      warning: `Overlay intensity ${intensity}% exceeds safe limit ${maxSafe}% for ECC level ${eccLevel}`,
    };
  }
  return { valid: true };
}

/**
 * Generate a readability heatmap
 */
export function generateReadabilityHeatmap(
  canvas: HTMLCanvasElement
): HTMLCanvasElement {
  const result = document.createElement('canvas');
  result.width = canvas.width;
  result.height = canvas.height;
  const ctx = result.getContext('2d');
  if (!ctx) return canvas;
  
  // Simple implementation - darker areas are more readable
  const sourceCtx = canvas.getContext('2d');
  if (!sourceCtx) return canvas;
  
  const imageData = sourceCtx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
    // Green = readable (high contrast), Red = problematic
    if (brightness < 128) {
      data[i] = 0;     // R
      data[i + 1] = 255; // G
      data[i + 2] = 0;   // B
    } else {
      data[i] = 255;   // R
      data[i + 1] = 0;   // G
      data[i + 2] = 0;   // B
    }
    data[i + 3] = 128; // Semi-transparent
  }
  
  ctx.putImageData(imageData, 0, 0);
  return result;
}

/**
 * Simulate scanning under various conditions
 */
export function simulateScan(
  canvas: HTMLCanvasElement,
  expectedContent: string,
  conditions: 'ideal' | 'blur' | 'noise' | 'low_light' = 'ideal'
): ScanSimulationResult {
  let testCanvas = canvas;
  
  switch (conditions) {
    case 'blur':
      testCanvas = applyBlurSimulation(canvas, 2);
      break;
    case 'noise':
      testCanvas = applyNoiseSimulation(canvas, 0.1);
      break;
    case 'low_light':
      testCanvas = applyNoiseSimulation(applyBlurSimulation(canvas, 1), 0.05);
      break;
  }
  
  const result = scanCanvas(testCanvas);
  
  return {
    success: result?.data === expectedContent,
    data: result?.data ?? null,
    confidence: result?.data === expectedContent ? 1 : 0,
    conditions,
  };
}

/**
 * Comprehensive QR analysis
 */
export function analyzeQR(
  canvas: HTMLCanvasElement,
  expectedContent?: string
): AnalysisResult {
  const warnings: AnalysisWarning[] = [];
  const issues: AnalysisIssue[] = [];
  
  // Try to scan
  const scanResult = scanCanvas(canvas);
  const scannable = !!scanResult;
  
  if (!scannable) {
    issues.push({
      type: 'scan_failed',
      message: 'QR code could not be scanned',
    });
  } else if (expectedContent && scanResult.data !== expectedContent) {
    issues.push({
      type: 'content_mismatch',
      message: `Scanned content does not match expected: got "${scanResult.data}"`,
    });
  }
  
  return {
    valid: scannable && (!expectedContent || scanResult?.data === expectedContent),
    scannable,
    warnings,
    issues,
    contrast: null,
    moduleSize: null,
    quietZone: null,
  };
}

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

export default SafetyAnalyzer;
