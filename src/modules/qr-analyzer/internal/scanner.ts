/**
 * QR Scanner/Validator Module
 * Uses jsQR to decode and validate generated QR codes
 */

import jsQR from 'jsqr';

export interface QRLocation {
  topLeftCorner: { x: number; y: number };
  topRightCorner: { x: number; y: number };
  bottomLeftCorner: { x: number; y: number };
  bottomRightCorner: { x: number; y: number };
}

export interface ScanResult {
  data: string;
  location: QRLocation;
  binaryData?: Uint8ClampedArray;
}

export interface ValidationResult {
  valid: boolean;
  scanned: boolean;
  data: string | null;
  expected: string | null;
  match: boolean;
  error?: string;
  attempts?: number;
}

/**
 * Scan a canvas for QR codes
 */
export function scanCanvas(canvas: HTMLCanvasElement): ScanResult | null {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return scanImageData(imageData);
}

/**
 * Scan ImageData for QR codes
 */
export function scanImageData(imageData: ImageData): ScanResult | null {
  const result = jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: 'attemptBoth',
  });
  
  if (!result) return null;
  
  return {
    data: result.data,
    location: result.location,
    binaryData: result.binaryData,
  };
}

/**
 * Scan a File for QR codes
 */
export async function scanFile(file: File): Promise<ScanResult | null> {
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
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

/**
 * Validate a QR code against expected content
 */
export function validateQRCode(
  canvas: HTMLCanvasElement,
  expectedContent: string
): ValidationResult {
  const result = scanCanvas(canvas);
  
  if (!result) {
    return {
      valid: false,
      scanned: false,
      data: null,
      expected: expectedContent,
      match: false,
      error: 'Could not scan QR code',
    };
  }
  
  const match = result.data === expectedContent;
  
  return {
    valid: match,
    scanned: true,
    data: result.data,
    expected: expectedContent,
    match,
  };
}

/**
 * Validate QR code with multiple attempts at different scales
 */
export function validateQRCodeRobust(
  canvas: HTMLCanvasElement,
  expectedContent: string,
  maxAttempts = 3
): ValidationResult {
  // First try at original size
  let result = validateQRCode(canvas, expectedContent);
  if (result.valid) {
    return { ...result, attempts: 1 };
  }
  
  // Try with scaled versions
  const scales = [2, 0.5, 1.5];
  for (let i = 0; i < Math.min(maxAttempts - 1, scales.length); i++) {
    const scale = scales[i];
    const scaledCanvas = document.createElement('canvas');
    scaledCanvas.width = Math.round(canvas.width * scale);
    scaledCanvas.height = Math.round(canvas.height * scale);
    const ctx = scaledCanvas.getContext('2d');
    if (ctx) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
      result = validateQRCode(scaledCanvas, expectedContent);
      if (result.valid) {
        return { ...result, attempts: i + 2 };
      }
    }
  }
  
  return { ...result, attempts: maxAttempts };
}

/**
 * Validate multiple animation frames
 */
export function validateFrames(
  frames: HTMLCanvasElement[],
  expectedContent: string,
  sampleSize = 5
): { valid: boolean; successRate: number; results: ValidationResult[] } {
  const step = Math.max(1, Math.floor(frames.length / sampleSize));
  const results: ValidationResult[] = [];
  
  for (let i = 0; i < frames.length; i += step) {
    const result = validateQRCodeRobust(frames[i], expectedContent);
    results.push(result);
  }
  
  const successCount = results.filter(r => r.valid).length;
  const successRate = successCount / results.length;
  
  return {
    valid: successRate >= 0.8, // 80% success rate required
    successRate,
    results,
  };
}

/**
 * QR Scanner class for object-oriented usage
 */
export const QRScanner = {
  scanCanvas,
  scanImageData,
  scanFile,
  validateQRCode,
  validateQRCodeRobust,
  validateFrames,
};

export default QRScanner;
