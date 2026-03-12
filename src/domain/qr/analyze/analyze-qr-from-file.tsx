import { decodeQRFromCanvas } from './decoder';
import type { QRAnalysisResult } from '../../../modules/qr-analyzer/types';
import { nowMs } from './now-ms';
import { withTotalAnalysisTiming } from './with-total-analysis-timing';

/**
 * Analyze a QR code from a File
 */
export async function analyzeQRFromFile(file: File): Promise<QRAnalysisResult> {
  const startedAtMs = nowMs();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const result = decodeQRFromCanvas(canvas);
          resolve(withTotalAnalysisTiming(result, startedAtMs));
        } else {
          resolve(
            withTotalAnalysisTiming(
              {
                success: false,
                error: 'Could not get canvas context',
                errorType: 'unknown',
                version: null,
                moduleCount: 0,
                eccLevel: null,
                maskPattern: null,
                encodingMode: null,
                errorsCorrected: null,
                estimatedModulePx: null,
              },
              startedAtMs
            )
          );
        }
      };
      img.onerror = () => {
        resolve(
          withTotalAnalysisTiming(
            {
              success: false,
              error: 'Failed to load image',
              errorType: 'unknown',
              version: null,
              moduleCount: 0,
              eccLevel: null,
              maskPattern: null,
              encodingMode: null,
              errorsCorrected: null,
              estimatedModulePx: null,
            },
            startedAtMs
          )
        );
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      resolve(
        withTotalAnalysisTiming(
          {
            success: false,
            error: 'Failed to read file',
            errorType: 'unknown',
            version: null,
            moduleCount: 0,
            eccLevel: null,
            maskPattern: null,
            encodingMode: null,
            errorsCorrected: null,
            estimatedModulePx: null,
          },
          startedAtMs
        )
      );
    };
    reader.readAsDataURL(file);
  });
}
