/**
 * QR Analyzer - Main Entry Point
 * Provides comprehensive QR code analysis combining content, structure, and safety analysis
 */

import { createLogger } from '../../lib/logger';
import { decodeQRFromCanvas } from './decoder';
import type { QRAnalysisResult } from './types';

const _log = createLogger('ANALYZER');

function nowMs(): number {
  return typeof globalThis.performance?.now === 'function'
    ? globalThis.performance.now()
    : Date.now();
}

function withTotalAnalysisTiming(result: QRAnalysisResult, startedAtMs: number): QRAnalysisResult {
  const totalAnalysisMs = Math.round((nowMs() - startedAtMs) * 100) / 100;
  return {
    ...result,
    timing: {
      ...result.timing,
      totalAnalysisMs,
    },
  };
}

/**
 * Analyze a QR code from a canvas element
 */
export async function analyzeQRFromCanvas(canvas: HTMLCanvasElement): Promise<QRAnalysisResult> {
  const startedAtMs = nowMs();
  const result = decodeQRFromCanvas(canvas);
  return withTotalAnalysisTiming(result, startedAtMs);
}

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

/**
 * Analyze a QR code from a URL
 */
export async function analyzeQRFromUrl(url: string): Promise<QRAnalysisResult> {
  const startedAtMs = nowMs();
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
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
      // Check if it's likely a CORS error
      resolve(
        withTotalAnalysisTiming(
          {
            success: false,
            error:
              'Failed to load image from URL. The server may be blocking cross-origin requests.',
            errorType: 'cors_blocked',
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

    img.src = url;
  });
}

/**
 * Analyze a QR code with full safety analysis (synchronous, for camera capture)
 */
export function analyzeQRCode(canvas: HTMLCanvasElement): QRAnalysisResult {
  const startedAtMs = nowMs();
  const result = decodeQRFromCanvas(canvas);
  return withTotalAnalysisTiming(result, startedAtMs);
}
