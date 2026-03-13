import type { QRAnalysisResult } from './types';
import type { AnalysisExportData } from './analysis-export-data';
export type { AnalysisExportData } from './analysis-export-data';

export interface AnalysisExportGeneratorSettings {
  text?: string;
  ecc?: QRAnalysisResult['eccLevel'];
  version?: number | null;
  maskPattern?: number | null;
  encodingMode?: 'numeric' | 'alphanumeric' | 'byte' | 'kanji';
  fgColor?: string;
  bgColor?: string;
}
