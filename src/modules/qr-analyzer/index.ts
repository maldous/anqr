/**
 * QR Analyzer Module
 * Analyzes QR codes from images and extracts metadata
 */

export * from './types';
export { detectContentType } from './content-detection';
export { decodeQRFromCanvas } from './decoder';

import type { QRAnalysisResult } from './types';
import { decodeQRFromCanvas } from './decoder';

/**
 * Analyze a QR code from a canvas element
 */
export function analyzeQRCode(canvas: HTMLCanvasElement): QRAnalysisResult {
  return decodeQRFromCanvas(canvas);
}

/**
 * Analyze a QR code from an image file
 */
export async function analyzeQRFromFile(file: File): Promise<QRAnalysisResult> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        URL.revokeObjectURL(url);
        resolve({
          success: false,
          error: 'Could not create canvas context',
          errorType: 'unknown',
          version: null,
          moduleCount: 0,
          eccLevel: null,
          maskPattern: null,
          encodingMode: null,
          errorsCorrected: null,
          estimatedModulePx: null,
        });
        return;
      }

      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      resolve(analyzeQRCode(canvas));
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        success: false,
        error: 'Failed to load image file',
        errorType: 'unknown',
        version: null,
        moduleCount: 0,
        eccLevel: null,
        maskPattern: null,
        encodingMode: null,
        errorsCorrected: null,
        estimatedModulePx: null,
      });
    };

    img.src = url;
  });
}

/**
 * Analyze a QR code from a URL
 */
export async function analyzeQRFromUrl(url: string): Promise<QRAnalysisResult> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve({
          success: false,
          error: 'Could not create canvas context',
          errorType: 'unknown',
          version: null,
          moduleCount: 0,
          eccLevel: null,
          maskPattern: null,
          encodingMode: null,
          errorsCorrected: null,
          estimatedModulePx: null,
        });
        return;
      }

      try {
        ctx.drawImage(img, 0, 0);
        resolve(analyzeQRCode(canvas));
      } catch (err) {
        // CORS error when drawing to canvas
        resolve({
          success: false,
          error: 'Image blocked by CORS policy. Please download the image and upload it instead.',
          errorType: 'cors_blocked',
          version: null,
          moduleCount: 0,
          eccLevel: null,
          maskPattern: null,
          encodingMode: null,
          errorsCorrected: null,
          estimatedModulePx: null,
        });
      }
    };

    img.onerror = () => {
      resolve({
        success: false,
        error: 'Failed to load image from URL. The image may be blocked by CORS policy.',
        errorType: 'cors_blocked',
        version: null,
        moduleCount: 0,
        eccLevel: null,
        maskPattern: null,
        encodingMode: null,
        errorsCorrected: null,
        estimatedModulePx: null,
      });
    };

    img.src = url;
  });
}

// Default export
const QRAnalyzer = {
  analyzeQRCode,
  analyzeQRFromFile,
  analyzeQRFromUrl,
};

export default QRAnalyzer;
