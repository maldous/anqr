import {AnalysisErrorType, QRAnalysisResult, confidence, contentType, dataCapacity, detectedColors, eccLevel, encodingMode, errorsCorrected, imageProperties, location, maskPattern, moduleMatrix, payload, payloadBytes, quietZone, structuralAnalysis, warnings} from '../shared';

export function createErrorResult(errorType: AnalysisErrorType, error: string): QRAnalysisResult {
  return {
    success: false,
    error,
    errorType,
    payload: null,
    payloadBytes: null,
    version: null,
    moduleCount: null,
    eccLevel: null,
    maskPattern: null,
    encodingMode: null,
    quietZone: null,
    moduleMatrix: null,
    location: null,
    confidence: 'low',
    warnings: [],
    errorsCorrected: null,
    // Enhanced analysis fields
    contentType: null,
    detectedColors: null,
    estimatedModulePx: null,
    dataCapacity: null,
    structuralAnalysis: null,
    imageProperties: null,
    debugLog: null,
  };
}

