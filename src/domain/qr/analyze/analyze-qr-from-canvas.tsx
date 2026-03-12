import type { QRAnalysisResult } from '../../../modules/qr-analyzer/types';
import { analyzeQRSync } from './analyzer._internal';

/**
 * Analyze a QR code from a canvas element
 */
export async function analyzeQRFromCanvas(canvas: HTMLCanvasElement): Promise<QRAnalysisResult> {
  return analyzeQRSync(canvas);
}
