import type { QRAnalysisResult } from '../../../modules/qr-analyzer/types';
import { analyzeQRSync } from './analyze-qr-sync';

/**
 * Analyze a QR code from a canvas element
 */
export async function analyzeQRFromCanvas(canvas: HTMLCanvasElement): Promise<QRAnalysisResult> {
  return analyzeQRSync(canvas);
}
