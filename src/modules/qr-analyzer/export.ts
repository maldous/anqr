import type { QRAnalysisResult } from './types';

export type { AnalysisExportGeneratorSettings, AnalysisExportData } from './export.types';
import type { AnalysisExportGeneratorSettings, AnalysisExportData } from './export.types';

export function buildAnalysisExportData(
  result: QRAnalysisResult,
  options: {
    timestamp?: string;
    source?: 'file' | 'url' | 'camera' | 'generator' | null;
    actualUsedVersion?: number | null;
  } = {}
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
      dominantColors: result.dominantColors,
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
        encodeMs: result.timing?.encodeMs ?? null,
        renderMs: result.timing?.renderMs ?? null,
        exportMs: result.timing?.exportMs ?? null,
      },
    },
    generatorSettings,
  };
}
