/**
 * QR Scanner/Validator Module
 * Uses our own QR decoder to decode and validate generated QR codes
 */

import { decodeQR } from './qr-decoder';

// ============================================
// TYPES
// ============================================

export interface ScanResult {
  success: boolean;
  data: string | null;
  error: string | null;
  location: QRLocation | null;
  /** Time taken to scan in milliseconds */
  scanTimeMs: number;
}

export interface QRLocation {
  topLeftCorner: { x: number; y: number };
  topRightCorner: { x: number; y: number };
  bottomLeftCorner: { x: number; y: number };
  bottomRightCorner: { x: number; y: number };
}

export interface ValidationResult {
  isValid: boolean;
  isReadable: boolean;
  matchesExpected: boolean;
  decodedData: string | null;
  expectedData: string;
  error: string | null;
  scanTimeMs: number;
  confidence: 'high' | 'medium' | 'low' | 'none';
}

// ============================================
// SCANNING
// ============================================

/**
 * Scan a QR code from a canvas element
 */
export function scanCanvas(canvas: HTMLCanvasElement): ScanResult {
  const startTime = performance.now();

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return {
      success: false,
      data: null,
      error: 'Could not get canvas context',
      location: null,
      scanTimeMs: performance.now() - startTime,
    };
  }

  try {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return scanImageData(imageData, startTime);
  } catch (err) {
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : 'Unknown error',
      location: null,
      scanTimeMs: performance.now() - startTime,
    };
  }
}

/**
 * Scan a QR code from ImageData
 */
export function scanImageData(imageData: ImageData, startTime = performance.now()): ScanResult {
  try {
    const result = decodeQR(imageData, { inversionAttempts: 'attemptBoth' });

    if (result && result.success && result.data) {
      return {
        success: true,
        data: result.data,
        error: null,
        location: result.location,
        scanTimeMs: performance.now() - startTime,
      };
    } else {
      return {
        success: false,
        data: null,
        error: 'No QR code found in image',
        location: null,
        scanTimeMs: performance.now() - startTime,
      };
    }
  } catch (err) {
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : 'Scan failed',
      location: null,
      scanTimeMs: performance.now() - startTime,
    };
  }
}

/**
 * Scan a QR code from a File (image)
 */
export async function scanFile(file: File): Promise<ScanResult> {
  const startTime = performance.now();

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({
            success: false,
            data: null,
            error: 'Could not get canvas context',
            location: null,
            scanTimeMs: performance.now() - startTime,
          });
          return;
        }
        ctx.drawImage(img, 0, 0);

        const result = scanCanvas(canvas);
        result.scanTimeMs = performance.now() - startTime;
        resolve(result);
      };

      img.onerror = () => {
        resolve({
          success: false,
          data: null,
          error: 'Failed to load image',
          location: null,
          scanTimeMs: performance.now() - startTime,
        });
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      resolve({
        success: false,
        data: null,
        error: 'Failed to read file',
        location: null,
        scanTimeMs: performance.now() - startTime,
      });
    };

    reader.readAsDataURL(file);
  });
}

// ============================================
// VALIDATION
// ============================================

/**
 * Validate a generated QR code canvas against expected data
 */
export function validateQRCode(canvas: HTMLCanvasElement, expectedData: string): ValidationResult {
  const scanResult = scanCanvas(canvas);

  if (!scanResult.success) {
    return {
      isValid: false,
      isReadable: false,
      matchesExpected: false,
      decodedData: null,
      expectedData,
      error: scanResult.error,
      scanTimeMs: scanResult.scanTimeMs,
      confidence: 'none',
    };
  }

  const matchesExpected = scanResult.data === expectedData;

  // Determine confidence based on scan time and match
  let confidence: 'high' | 'medium' | 'low' | 'none' = 'none';
  if (scanResult.success) {
    if (scanResult.scanTimeMs < 50) {
      confidence = 'high';
    } else if (scanResult.scanTimeMs < 150) {
      confidence = 'medium';
    } else {
      confidence = 'low';
    }
  }

  return {
    isValid: matchesExpected,
    isReadable: true,
    matchesExpected,
    decodedData: scanResult.data,
    expectedData,
    error: matchesExpected ? null : 'Decoded data does not match expected content',
    scanTimeMs: scanResult.scanTimeMs,
    confidence,
  };
}

/**
 * Validate with multiple scale attempts for robustness
 * Some QR codes may be more readable at different scales
 */
export function validateQRCodeRobust(
  canvas: HTMLCanvasElement,
  expectedData: string
): ValidationResult {
  // Try original size first
  const originalResult = validateQRCode(canvas, expectedData);
  if (originalResult.isValid && originalResult.confidence === 'high') {
    return originalResult;
  }

  // Try scaled versions if original didn't work well
  const scales = [2, 0.5, 1.5, 0.75];

  for (const scale of scales) {
    const scaledCanvas = document.createElement('canvas');
    scaledCanvas.width = Math.round(canvas.width * scale);
    scaledCanvas.height = Math.round(canvas.height * scale);
    const scaledCtx = scaledCanvas.getContext('2d');
    if (!scaledCtx) continue;
    scaledCtx.imageSmoothingEnabled = false;
    scaledCtx.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);

    const result = validateQRCode(scaledCanvas, expectedData);
    if (result.isValid) {
      return result;
    }

    // If we found something readable but it doesn't match, return that
    if (result.isReadable && !originalResult.isReadable) {
      return result;
    }
  }

  return originalResult;
}

// ============================================
// BATCH VALIDATION
// ============================================

/**
 * Validate multiple frames (for animated QR codes)
 */
export function validateFrames(
  frames: HTMLCanvasElement[],
  expectedData: string
): { allValid: boolean; results: ValidationResult[]; failedFrames: number[] } {
  const results: ValidationResult[] = [];
  const failedFrames: number[] = [];

  for (let i = 0; i < frames.length; i++) {
    const result = validateQRCode(frames[i], expectedData);
    results.push(result);
    if (!result.isValid) {
      failedFrames.push(i);
    }
  }

  return {
    allValid: failedFrames.length === 0,
    results,
    failedFrames,
  };
}

// ============================================
// EXPORT
// ============================================

export const QRScanner = {
  scanCanvas,
  scanImageData,
  scanFile,
  validateQRCode,
  validateQRCodeRobust,
  validateFrames,
};

export default QRScanner;
