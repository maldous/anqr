import { decodeQRFromCanvas } from './decoder';
import type { QRAnalysisResult } from '../../../modules/qr-analyzer/types';

export function nowMs(): number {
  return typeof globalThis.performance?.now === 'function'
    ? globalThis.performance.now()
    : Date.now();
}

export function withTotalAnalysisTiming(result: QRAnalysisResult, startedAtMs: number): QRAnalysisResult {
  const totalAnalysisMs = Math.round((nowMs() - startedAtMs) * 100) / 100;
  return {
    ...result,
    timing: {
      ...result.timing,
      totalAnalysisMs,
    },
  };
}

export function analyzeQRSync(canvas: HTMLCanvasElement): QRAnalysisResult {
  const startedAtMs = nowMs();
  const result = decodeQRFromCanvas(canvas);
  return withTotalAnalysisTiming(result, startedAtMs);
}

