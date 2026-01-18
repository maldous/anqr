/**
 * QR Scanner Module
 * Uses our own QR decoder for scanning
 */

import { decodeQR } from '../../qr-decoder';

export interface QRLocation {
  topLeftCorner: { x: number; y: number };
  topRightCorner: { x: number; y: number };
  bottomLeftCorner: { x: number; y: number };
  bottomRightCorner: { x: number; y: number };
}

export interface ScanResult {
  data: string | null;
  location: QRLocation | null;
  binaryData?: Uint8Array;
}

export interface ValidationResult {
  valid: boolean;
  data?: string;
  error?: string;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Scan a canvas for QR code
 */
export function scanCanvas(canvas: HTMLCanvasElement | OffscreenCanvas): ScanResult {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return { data: null, location: null };
  }

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return scanImageData(imageData);
}

/**
 * Scan image data for QR code
 */
export function scanImageData(imageData: ImageData): ScanResult {
  try {
    const result = decodeQR(imageData, { inversionAttempts: 'attemptBoth' });

    if (result && result.success && result.data) {
      return {
        data: result.data,
        location: result.location ?? null,
      };
    }

    return { data: null, location: null };
  } catch {
    return { data: null, location: null };
  }
}

/**
 * Scan a file for QR code
 */
export async function scanFile(file: File): Promise<ScanResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(scanCanvas(canvas));
        } else {
          resolve({ data: null, location: null });
        }
      };
      img.onerror = () => resolve({ data: null, location: null });
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve({ data: null, location: null });
    reader.readAsDataURL(file);
  });
}

/**
 * Validate QR code by scanning and comparing to expected content
 */
export function validateQRCode(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  expectedContent?: string
): ValidationResult {
  const result = scanCanvas(canvas);

  if (!result.data) {
    return {
      valid: false,
      error: 'No QR code detected',
      confidence: 'low',
    };
  }

  if (expectedContent && result.data !== expectedContent) {
    return {
      valid: false,
      data: result.data,
      error: 'Content does not match expected',
      confidence: 'medium',
    };
  }

  return {
    valid: true,
    data: result.data,
    confidence: 'high',
  };
}

/**
 * Validate QR code with multiple scan attempts
 */
export function validateQRCodeRobust(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  expectedContent?: string,
  attempts: number = 3
): ValidationResult {
  for (let i = 0; i < attempts; i++) {
    const result = validateQRCode(canvas, expectedContent);
    if (result.valid) return result;
  }

  return {
    valid: false,
    error: 'Failed to validate after multiple attempts',
    confidence: 'low',
  };
}

/**
 * Validate multiple frames (for animated QR codes)
 */
export function validateFrames(
  frames: HTMLCanvasElement[],
  expectedContent?: string
): { valid: boolean; validCount: number; totalCount: number } {
  let validCount = 0;
  for (const frame of frames) {
    const result = validateQRCode(frame, expectedContent);
    if (result.valid) validCount++;
  }

  return {
    valid: validCount === frames.length,
    validCount,
    totalCount: frames.length,
  };
}

/**
 * QRScanner class for backwards compatibility
 */
export const QRScanner = {
  scanCanvas,
  scanFile,
  scanImageData,
  validateQRCode,
  validateQRCodeRobust,
  validateFrames,
};

export default QRScanner;
