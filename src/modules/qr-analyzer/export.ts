import type { QRAnalysisResult } from './types';

export interface AnalysisExportGeneratorSettings {
  text?: string;
  ecc?: QRAnalysisResult['eccLevel'];
  version?: number | null;
  maskPattern?: number | null;
  encodingMode?: 'numeric' | 'alphanumeric' | 'byte' | 'kanji';
  fgColor?: string;
  bgColor?: string;
}

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
    };
  };
  generatorSettings: AnalysisExportGeneratorSettings;
}

interface BuildExportOptions {
  timestamp?: string;
  source?: 'file' | 'url' | 'camera' | 'generator' | null;
  actualUsedVersion?: number | null;
}

export function buildAnalysisExportData(
  result: QRAnalysisResult,
  options: BuildExportOptions = {}
): AnalysisExportData {
  const timestamp = options.timestamp ?? new Date().toISOString();
  const source = options.source ?? 'unknown';
  const moduleMatrix = result.moduleMatrix
    ? result.moduleMatrix.map((row) => row.map((cell) => (cell ? 1 : 0)).join(''))
    : undefined;

  const generatorSettings: AnalysisExportGeneratorSettings = {
    text: result.payload,
    ecc: result.eccLevel,
    version: options.actualUsedVersion ?? result.version,
    maskPattern: result.maskPattern,
    encodingMode:
      result.encodingMode && result.encodingMode !== 'unknown' && result.encodingMode !== 'mixed'
        ? result.encodingMode
        : undefined,
    fgColor: result.detectedColors?.foreground,
    bgColor: result.detectedColors?.background,
  };

  return {
    version: '1.1',
    timestamp,
    source,
    analysis: {
      payload: result.payload,
      payloadBytes: result.payloadBytes ? Array.from(result.payloadBytes) : undefined,
      version: result.version,
      moduleCount: result.moduleCount,
      eccLevel: result.eccLevel,
      maskPattern: result.maskPattern,
      encodingMode: result.encodingMode,
      confidence: result.confidence,
      warnings: result.warnings,
      contentType: result.contentType,
      detectedColors: result.detectedColors,
      estimatedModulePx: result.estimatedModulePx,
      quietZone: result.quietZone,
      dataCapacity: result.dataCapacity,
      structuralAnalysis: result.structuralAnalysis,
      imageProperties: result.imageProperties,
      geometry: result.geometry,
      timing: result.timing,
      errorsCorrected: result.errorsCorrected,
      decoderMetadata: result.decoderMetadata,
      moduleMatrix,
    },
    diagnostics: {
      summary: {
        scannable: result.success,
        hasQuietZone: !!result.quietZone,
        quietZoneAdequate: !!result.quietZone?.adequate,
        contrastRatio: result.detectedColors?.contrastRatio,
        estimatedRotationDeg: result.geometry?.estimatedRotationDeg,
        decodeMs: result.timing?.decodeMs ?? null,
        totalAnalysisMs: result.timing?.totalAnalysisMs ?? null,
      },
    },
    generatorSettings,
  };
}
