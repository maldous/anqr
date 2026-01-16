/**
 * QR Decoder - wrapper around jsQR for decoding
 */

import jsQR from 'jsqr';
import type { ECCLevel, QRAnalysisResult } from './types';
import { detectContentType } from './content-detection';

/**
 * Decode a QR code from canvas and extract all metadata
 */
export function decodeQRFromCanvas(canvas: HTMLCanvasElement): QRAnalysisResult {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return {
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
    };
  }

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  try {
    const code = jsQR(imageData.data, canvas.width, canvas.height, {
      inversionAttempts: 'attemptBoth',
    });

    if (!code) {
      return {
        success: false,
        error: 'No QR code detected in image',
        errorType: 'no_qr_detected',
        version: null,
        moduleCount: 0,
        eccLevel: null,
        maskPattern: null,
        encodingMode: null,
        errorsCorrected: null,
        estimatedModulePx: null,
      };
    }

    // Extract location info
    const { location } = code;
    const qrWidth = Math.abs(location.topRightCorner.x - location.topLeftCorner.x);
    const qrHeight = Math.abs(location.bottomLeftCorner.y - location.topLeftCorner.y);
    const qrSize = Math.max(qrWidth, qrHeight);

    // Estimate version and module count from detected size
    // This is approximate since we don't have direct access to the matrix
    const moduleCount = estimateModuleCount(code.data);
    const version = moduleCount > 0 ? Math.floor((moduleCount - 17) / 4) : null;
    const estimatedModulePx = moduleCount > 0 ? Math.round(qrSize / moduleCount) : null;

    // Detect content type
    const contentType = detectContentType(code.data);

    // Analyze colors from the QR region
    const detectedColors = analyzeColors(imageData, location);

    // Calculate quiet zone
    const quietZone = analyzeQuietZone(imageData, location, estimatedModulePx || 10);

    // Build module matrix if possible
    const moduleMatrix = buildModuleMatrix(imageData, location, moduleCount);

    return {
      success: true,
      payload: code.data,
      payloadBytes: new TextEncoder().encode(code.data),
      version,
      moduleCount,
      eccLevel: null, // jsQR doesn't expose this directly
      maskPattern: null, // jsQR doesn't expose this directly
      encodingMode: detectEncodingMode(code.data),
      errorsCorrected: null,
      contentType,
      detectedColors,
      estimatedModulePx,
      quietZone,
      structuralAnalysis: {
        hasFinderPatterns: true, // If we decoded it, finder patterns were found
        hasTimingPatterns: true,
        hasAlignmentPatterns: version !== null && version > 1,
        alignmentPatternCount: version !== null ? getAlignmentPatternCount(version) : 0,
      },
      imageProperties: {
        width: canvas.width,
        height: canvas.height,
        aspectRatio: Math.round((canvas.width / canvas.height) * 100) / 100,
        estimatedQrSizePx: Math.round(qrSize),
      },
      moduleMatrix,
      confidence: 'high',
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to decode QR code',
      errorType: 'decode_error',
      version: null,
      moduleCount: 0,
      eccLevel: null,
      maskPattern: null,
      encodingMode: null,
      errorsCorrected: null,
      estimatedModulePx: null,
    };
  }
}

/**
 * Estimate module count from payload length
 */
function estimateModuleCount(payload: string): number {
  const len = payload.length;
  // Rough estimation based on data capacity
  // Version 1: 21x21, Version 2: 25x25, etc.
  // This is approximate
  if (len <= 25) return 21;
  if (len <= 47) return 25;
  if (len <= 77) return 29;
  if (len <= 114) return 33;
  if (len <= 154) return 37;
  if (len <= 195) return 41;
  if (len <= 224) return 45;
  if (len <= 279) return 49;
  if (len <= 335) return 53;
  if (len <= 395) return 57;
  return 61; // Approximate for larger payloads
}

/**
 * Detect encoding mode from payload content
 */
function detectEncodingMode(payload: string): 'numeric' | 'alphanumeric' | 'byte' | 'kanji' | 'mixed' | 'unknown' {
  if (/^\d+$/.test(payload)) return 'numeric';
  if (/^[0-9A-Z $%*+\-./:]+$/.test(payload)) return 'alphanumeric';
  // Check for Shift-JIS characters (Japanese)
  if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(payload)) return 'kanji';
  return 'byte';
}

/**
 * Get alignment pattern count for a version
 */
function getAlignmentPatternCount(version: number): number {
  if (version < 2) return 0;
  const alignmentPositions = Math.floor(version / 7) + 2;
  const totalPositions = alignmentPositions * alignmentPositions;
  // Subtract positions that overlap with finder patterns (3 corners)
  return totalPositions - 3;
}

/**
 * Analyze colors in the QR code region
 */
function analyzeColors(
  imageData: ImageData,
  location: { topLeftCorner: { x: number; y: number }; bottomRightCorner: { x: number; y: number } }
): { foreground: string; background: string; contrastRatio: number } {
  const { data, width } = imageData;
  const minX = Math.max(0, Math.floor(location.topLeftCorner.x));
  const maxX = Math.min(imageData.width - 1, Math.ceil(location.bottomRightCorner.x));
  const minY = Math.max(0, Math.floor(location.topLeftCorner.y));
  const maxY = Math.min(imageData.height - 1, Math.ceil(location.bottomRightCorner.y));

  const darkPixels: number[] = [];
  const lightPixels: number[] = [];

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const idx = (y * width + x) * 4;
      const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      if (gray < 128) {
        darkPixels.push(gray);
      } else {
        lightPixels.push(gray);
      }
    }
  }

  // Get average colors
  const avgDark = darkPixels.length > 0 ? Math.round(darkPixels.reduce((a, b) => a + b, 0) / darkPixels.length) : 0;
  const avgLight = lightPixels.length > 0 ? Math.round(lightPixels.reduce((a, b) => a + b, 0) / lightPixels.length) : 255;

  // Calculate contrast ratio
  const l1 = (avgLight / 255 + 0.05);
  const l2 = (avgDark / 255 + 0.05);
  const contrastRatio = Math.round((Math.max(l1, l2) / Math.min(l1, l2)) * 100) / 100;

  return {
    foreground: `#${avgDark.toString(16).padStart(2, '0').repeat(3)}`,
    background: `#${avgLight.toString(16).padStart(2, '0').repeat(3)}`,
    contrastRatio,
  };
}

/**
 * Analyze quiet zone around QR code
 */
function analyzeQuietZone(
  imageData: ImageData,
  location: { topLeftCorner: { x: number; y: number }; bottomRightCorner: { x: number; y: number }; bottomLeftCorner: { x: number; y: number }; topRightCorner: { x: number; y: number } },
  modulePx: number
): { top: number; right: number; bottom: number; left: number; adequate: boolean } {
  // Measure white space around the QR code in module units
  const top = Math.max(0, Math.floor(location.topLeftCorner.y / modulePx));
  const left = Math.max(0, Math.floor(location.topLeftCorner.x / modulePx));
  const bottom = Math.max(0, Math.floor((imageData.height - location.bottomLeftCorner.y) / modulePx));
  const right = Math.max(0, Math.floor((imageData.width - location.topRightCorner.x) / modulePx));

  // QR spec requires 4 modules of quiet zone
  const adequate = top >= 4 && right >= 4 && bottom >= 4 && left >= 4;

  return { top, right, bottom, left, adequate };
}

/**
 * Build module matrix from image
 */
function buildModuleMatrix(
  imageData: ImageData,
  location: { topLeftCorner: { x: number; y: number }; bottomRightCorner: { x: number; y: number } },
  moduleCount: number
): boolean[][] | undefined {
  if (moduleCount <= 0) return undefined;

  const { data, width } = imageData;
  const qrWidth = location.bottomRightCorner.x - location.topLeftCorner.x;
  const qrHeight = location.bottomRightCorner.y - location.topLeftCorner.y;
  const modulePxX = qrWidth / moduleCount;
  const modulePxY = qrHeight / moduleCount;

  const matrix: boolean[][] = [];

  for (let row = 0; row < moduleCount; row++) {
    const matrixRow: boolean[] = [];
    for (let col = 0; col < moduleCount; col++) {
      // Sample center of module
      const x = Math.round(location.topLeftCorner.x + (col + 0.5) * modulePxX);
      const y = Math.round(location.topLeftCorner.y + (row + 0.5) * modulePxY);
      
      if (x >= 0 && x < imageData.width && y >= 0 && y < imageData.height) {
        const idx = (y * width + x) * 4;
        const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
        matrixRow.push(gray < 128); // true = dark module
      } else {
        matrixRow.push(false);
      }
    }
    matrix.push(matrixRow);
  }

  return matrix;
}
