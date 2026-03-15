import type { QRAnalysisResult } from './types';
import type { AnalysisExportGeneratorSettings } from './analysis-export-generator-settings';

export interface AnalysisExportData {
  version: '1.1';
  timestamp: string;
  source?: 'file' | 'url' | 'camera' | 'generator' | 'unknown';
  analysis: {
    payload?: string;
    payloadBytes?: number[];
    version: number | null;
    moduleCount: number;
    eccLevel: QRAnalysisResult['eccLevel'];
    maskPattern: number | null;
    encodingMode: QRAnalysisResult['encodingMode'];
    confidence?: QRAnalysisResult['confidence'];
    warnings?: string[];
    contentType?: QRAnalysisResult['contentType'];
    detectedColors?: QRAnalysisResult['detectedColors'];
    dominantColors?: QRAnalysisResult['dominantColors'];
    estimatedModulePx: number | null;
    quietZone?: QRAnalysisResult['quietZone'];
    dataCapacity?: QRAnalysisResult['dataCapacity'];
    structuralAnalysis?: QRAnalysisResult['structuralAnalysis'];
    imageProperties?: QRAnalysisResult['imageProperties'];
    geometry?: QRAnalysisResult['geometry'];
    timing?: QRAnalysisResult['timing'];
    errorsCorrected: number | null;
    decoderMetadata?: QRAnalysisResult['decoderMetadata'];
    moduleMatrix?: string[];
  };
  diagnostics: {
    summary: {
      scannable: boolean;
      hasQuietZone: boolean;
      quietZoneAdequate: boolean;
      contrastRatio?: number;
      estimatedRotationDeg?: number;
      decodeMs?: number | null;
      totalAnalysisMs?: number | null;
      encodeMs?: number | null;
      renderMs?: number | null;
      exportMs?: number | null;
    };
  };
  generatorSettings: AnalysisExportGeneratorSettings;
}
