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
