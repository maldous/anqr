/**
 * QR Decoder - wrapper around jsQR for decoding
 */

import jsQR from 'jsqr';
import type { ECCLevel, QRAnalysisResult } from './types';
import { detectContentType } from './content-detection';

interface QRLocation {
  topLeftCorner: { x: number; y: number };
  topRightCorner: { x: number; y: number };
  bottomLeftCorner: { x: number; y: number };
  bottomRightCorner: { x: number; y: number };
}

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

    // Detect actual module count and size from finder patterns
    const detected = detectModuleCountFromFinder(imageData, location, qrSize);
    const moduleCount = detected.moduleCount;
    const estimatedModulePx = detected.modulePx;
    const version = moduleCount > 0 ? Math.floor((moduleCount - 17) / 4) : null;

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
 * Detect actual module count by analyzing finder patterns
 * Finder patterns are always 7 modules wide with a 1:1:3:1:1 ratio
 */
function detectModuleCountFromFinder(
  imageData: ImageData,
  location: QRLocation,
  qrSize: number
): { moduleCount: number; modulePx: number } {
  
  // The jsQR location corners are at the CENTERS of the finder patterns
  // Finder patterns are 7 modules, so the corner is at the center (3.5 modules in)
  // The actual QR size includes the full finder patterns on both sides
  
  // Calculate the distance between finder pattern centers
  // This distance spans from center of top-left finder to center of top-right finder
  // Which is (moduleCount - 7) modules (since each center is 3.5 modules from edge)
  const topWidth = Math.abs(location.topRightCorner.x - location.topLeftCorner.x);
  const leftHeight = Math.abs(location.bottomLeftCorner.y - location.topLeftCorner.y);
  const finderCenterDistance = Math.max(topWidth, leftHeight);
  
  // Try to detect module size by scanning through the finder pattern
  const modulePxFromScan = detectModuleSizeFromScan(imageData, location);
  
  if (modulePxFromScan > 0) {
    // Calculate module count: the distance between centers is (moduleCount - 7) modules
    // So: finderCenterDistance = (moduleCount - 7) * modulePx
    // Therefore: moduleCount = (finderCenterDistance / modulePx) + 7
    const calculatedCount = Math.round(finderCenterDistance / modulePxFromScan) + 7;
    // QR versions: 21, 25, 29, 33... (21 + 4*n)
    const version = Math.round((calculatedCount - 21) / 4);
    const normalizedCount = 21 + Math.max(0, version) * 4;
    // Recalculate module size based on normalized count
    const adjustedModulePx = finderCenterDistance / (normalizedCount - 7);
    return { moduleCount: normalizedCount, modulePx: adjustedModulePx };
  }
  
  // Fallback: estimate from overall QR size
  // Try different versions and see which gives the closest module size
  // QR versions go 21, 25, 29, 33... modules
  let bestVersion = 1;
  let bestModulePx = qrSize / 21;
  let bestScore = Number.MAX_VALUE;
  
  for (let v = 1; v <= 40; v++) {
    const count = 17 + v * 4;
    const modulePx = finderCenterDistance / (count - 7);
    // Module pixels should be a reasonable integer-ish value
    const roundedPx = Math.round(modulePx);
    const error = Math.abs(modulePx - roundedPx);
    if (error < bestScore && roundedPx >= 1 && roundedPx <= 50) {
      bestScore = error;
      bestVersion = v;
      bestModulePx = modulePx;
    }
  }
  
  const moduleCount = 17 + bestVersion * 4;
  return { moduleCount, modulePx: bestModulePx };
}

/**
 * Detect module size by scanning through the top-left finder pattern
 * The finder pattern has a 1:1:3:1:1 ratio, so we can detect transitions
 */
function detectModuleSizeFromScan(
  imageData: ImageData,
  location: QRLocation
): number {
  const { data, width } = imageData;
  
  // Start from top-left corner (center of finder pattern) and scan left
  // to find the edge of the finder pattern, then measure its width
  const startX = Math.round(location.topLeftCorner.x);
  const startY = Math.round(location.topLeftCorner.y);
  
  // Scan horizontally to the left to find pattern edge, then to the right
  // The finder pattern is black-white-black-white-black (7 modules total)
  // From center, going left: 1.5 modules black, 1 module white, 1 module black to edge
  
  // Find the leftmost black pixel of the finder (scan left from center)
  let leftEdge = startX;
  for (let x = startX; x >= 0; x--) {
    const idx = (startY * width + x) * 4;
    const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
    if (gray > 180) { // Found white
      leftEdge = x + 1;
      break;
    }
    leftEdge = x;
  }
  
  // Find the rightmost black pixel of the finder (scan right from center)
  let rightEdge = startX;
  for (let x = startX; x < imageData.width; x++) {
    const idx = (startY * width + x) * 4;
    const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
    if (gray > 180) { // Found white
      rightEdge = x - 1;
      break;
    }
    rightEdge = x;
  }
  
  // The center black square of finder is 3 modules wide
  const centerBlackWidth = rightEdge - leftEdge + 1;
  if (centerBlackWidth > 6) {
    // Each module is approximately centerBlackWidth / 3
    return centerBlackWidth / 3;
  }
  
  // Alternative: scan outward and count transitions
  // From center going right: should hit white (1 mod), black (1 mod), white (quiet zone)
  const transitions: number[] = [];
  let lastGray = 0;
  let transitionStart = startX;
  
  for (let x = startX; x < Math.min(startX + 100, imageData.width); x++) {
    const idx = (startY * width + x) * 4;
    const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
    const isDark = gray < 128;
    const wasDark = lastGray < 128;
    
    if (x === startX) {
      lastGray = gray;
      continue;
    }
    
    if (isDark !== wasDark) {
      transitions.push(x - transitionStart);
      transitionStart = x;
    }
    lastGray = gray;
  }
  
  // The first few transitions from center should be: ~1.5 modules (to white), 1 module (white), 1 module (black), ...
  // Average the transition distances to estimate module size
  if (transitions.length >= 3) {
    // Skip first transition (partial module), use next transitions
    const moduleEstimates = transitions.slice(1, 4);
    const avgModulePx = moduleEstimates.reduce((a, b) => a + b, 0) / moduleEstimates.length;
    if (avgModulePx >= 1 && avgModulePx <= 50) {
      return avgModulePx;
    }
  }
  
  return 0; // Could not detect
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
  location: QRLocation,
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
 * Uses the finder pattern centers to calculate the actual QR grid
 */
function buildModuleMatrix(
  imageData: ImageData,
  location: QRLocation,
  moduleCount: number
): boolean[][] | undefined {
  if (moduleCount <= 0) return undefined;

  const { data, width } = imageData;
  
  // The jsQR location corners are at the CENTERS of the finder patterns
  // Top-left finder center = module position (3.5, 3.5) in the QR grid
  // Top-right finder center = module position (moduleCount - 3.5, 3.5)
  // Bottom-left finder center = module position (3.5, moduleCount - 3.5)
  
  // Calculate the transformation from module coordinates to pixel coordinates
  // Using the three finder pattern centers as reference points
  const tlX = location.topLeftCorner.x;
  const tlY = location.topLeftCorner.y;
  const trX = location.topRightCorner.x;
  const trY = location.topRightCorner.y;
  const blX = location.bottomLeftCorner.x;
  const blY = location.bottomLeftCorner.y;
  
  // The distance from top-left to top-right center spans (moduleCount - 7) modules
  // (from 3.5 to moduleCount - 3.5)
  const moduleSpan = moduleCount - 7;
  
  // Guard against division by zero (shouldn't happen with valid QR codes)
  if (moduleSpan <= 0) return undefined;
  
  // Calculate module size in each direction
  const dxRight = (trX - tlX) / moduleSpan;
  const dyRight = (trY - tlY) / moduleSpan;
  const dxDown = (blX - tlX) / moduleSpan;
  const dyDown = (blY - tlY) / moduleSpan;
  
  // The top-left finder center is at module position (3.5, 3.5)
  // So the top-left corner of the QR (module 0,0) is at:
  const originX = tlX - 3.5 * dxRight - 3.5 * dxDown;
  const originY = tlY - 3.5 * dyRight - 3.5 * dyDown;

  const matrix: boolean[][] = [];

  for (let row = 0; row < moduleCount; row++) {
    const matrixRow: boolean[] = [];
    for (let col = 0; col < moduleCount; col++) {
      // Calculate pixel position for center of this module
      const x = Math.round(originX + (col + 0.5) * dxRight + (row + 0.5) * dxDown);
      const y = Math.round(originY + (col + 0.5) * dyRight + (row + 0.5) * dyDown);
      
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
