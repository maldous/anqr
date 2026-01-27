/**
 * QR Decoder - uses our own decoder (no external dependencies)
 */

import { decodeQR } from '../qr-decoder';
import { detectContentType } from './analyzer-content';
// Shared logger
import { disableLogBuffer, enableLogBuffer, flushLogBuffer, qrAnalyzerLog as log } from './logger';
import type { ContentType, QRAnalysisResult, DecoderMetadata } from './types';

/**
 * Format content type as human-readable label
 */
function formatContentTypeLabel(type: ContentType): string {
  const labels: Record<ContentType, string> = {
    url: 'URL',
    wifi: 'WiFi Network',
    vcard: 'vCard Contact',
    mecard: 'MeCard Contact',
    email: 'Email',
    tel: 'Phone Number',
    sms: 'SMS',
    geo: 'Geographic Location',
    crypto_bitcoin: 'Bitcoin Payment',
    crypto_ethereum: 'Ethereum Payment',
    crypto_other: 'Cryptocurrency',
    epc_sepa: 'SEPA Payment',
    upi: 'UPI Payment',
    emv_qr: 'EMV Payment QR',
    swiss_qr_bill: 'Swiss QR Bill',
    calendar_event: 'Calendar Event',
    otp_auth: '2FA/OTP Setup',
    plain_text: 'Plain Text',
    unknown: 'Unknown',
  };
  return labels[type] || 'Unknown';
}

interface QRLocationCorners {
  topLeftCorner: { x: number; y: number };
  topRightCorner: { x: number; y: number };
  bottomLeftCorner: { x: number; y: number };
  bottomRightCorner: { x: number; y: number };
}

/**
 * Decode a QR code from canvas and extract all metadata
 */
export function decodeQRFromCanvas(canvas: HTMLCanvasElement): QRAnalysisResult {
  // Enable log buffering to capture debug info for failed detections
  enableLogBuffer();

  log('decode', 'Starting QR decode', { canvasWidth: canvas.width, canvasHeight: canvas.height });

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    log('decode', 'ERROR: Could not get canvas context');
    const debugLog = flushLogBuffer();
    disableLogBuffer();
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
      debugLog,
    };
  }

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  try {
    const code = decodeQR(imageData, { inversionAttempts: 'attemptBoth' });

    if (!(code?.success && code.data)) {
      log('decode', 'ERROR: No QR code detected by our decoder');
      const debugLog = flushLogBuffer();
      disableLogBuffer();
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
        debugLog,
      };
    }

    // Extract location info from our decoder
    // NOTE: location corners are the CENTERS of the 3 finder patterns
    // plus an extrapolated 4th corner (bottom-right)
    const location = code.location!;

    log('location', 'Finder pattern centers', {
      topLeft: location.topLeftCorner,
      topRight: location.topRightCorner,
      bottomLeft: location.bottomLeftCorner,
      bottomRight: location.bottomRightCorner,
    });

    // Calculate distances between finder pattern centers
    const topEdgeDist = Math.sqrt(
      (location.topRightCorner.x - location.topLeftCorner.x) ** 2 +
        (location.topRightCorner.y - location.topLeftCorner.y) ** 2
    );
    const leftEdgeDist = Math.sqrt(
      (location.bottomLeftCorner.x - location.topLeftCorner.x) ** 2 +
        (location.bottomLeftCorner.y - location.topLeftCorner.y) ** 2
    );
    const avgFinderDist = (topEdgeDist + leftEdgeDist) / 2;

    log('location', 'Finder pattern distances', {
      topEdge: topEdgeDist.toFixed(2),
      leftEdge: leftEdgeDist.toFixed(2),
      average: avgFinderDist.toFixed(2),
    });

    // Version must come from decoder - not estimated
    // If decoder couldn't determine the version, it will be null
    const version =
      typeof code.version === 'number' && code.version >= 1 && code.version <= 40
        ? code.version
        : null;

    // Module count derived from version (if available)
    const moduleCount = version !== null ? 17 + version * 4 : 0;

    // Estimate module pixel size from finder pattern distance (for visual analysis only)
    // This does NOT affect version - version ONLY comes from decoder
    const estimatedModulePx =
      moduleCount > 0 ? avgFinderDist / (moduleCount - 7) : null;

    log('detection', 'Module count from decoder (authoritative)', {
      moduleCount,
      version,
      estimatedModulePx: estimatedModulePx ? estimatedModulePx.toFixed(3) : 'null',
      source: version !== null ? 'Decoder (authoritative)' : 'NOT DETECTED - will fail reproduction',
    });

    // Warn if version not detected - reproduction will fail
    if (version === null) {
      log('detection', 'WARNING: Decoder did not provide version - reproduction will not work correctly');
    }

    // Detect content type
    const type = detectContentType(code.data!);
    const contentType = { type, label: formatContentTypeLabel(type) };

    // Analyze colors from the QR region
    const detectedColors = analyzeColors(imageData, location);
    log('colors', 'Detected colors', detectedColors);

    // Calculate quiet zone
    const quietZone = analyzeQuietZone(imageData, location, estimatedModulePx || 10);

    // Build module matrix if possible
    const moduleMatrix = buildModuleMatrix(imageData, location, moduleCount, estimatedModulePx);

    // Validate matrix by checking finder patterns
    if (moduleMatrix) {
      validateFinderPatterns(moduleMatrix, moduleCount);
    }

    const qrSize = avgFinderDist + 7 * estimatedModulePx; // Approximate full QR size

    const encodingMode = detectEncodingMode(code.data!);
    const payloadBytes =
      encodingMode === 'byte'
        ? stringToLatin1Bytes(code.data!)
        : new TextEncoder().encode(code.data!);

    // Success - flush and disable buffer (don't include debug log on success)
    flushLogBuffer();
    disableLogBuffer();

    // Build comprehensive decoder metadata for debugging
    const decoderMetadata: DecoderMetadata = {
      version: code.version ?? null,
      maskPattern: code.maskPattern ?? null,
      eccLevel: code.eccLevel ?? null,
      errorsCorrected: code.errorsCorrected ?? null,
      erasures: code.erasures ?? null,
      numBits: code.numBits ?? null,
      orientation: code.orientation ?? null,
      structuredAppendSequence: code.structuredAppendSequence ?? null,
      structuredAppendParity: code.structuredAppendParity ?? null,
      hasStructuredAppend: (code.structuredAppendSequence ?? -1) >= 0,
      byteSegmentCount: code.dataBytes ? 1 : 0,
      totalByteLength: code.dataBytes?.length ?? 0,
    };

    log('decoder', 'Complete decoder metadata (authoritative)', {
      version: decoderMetadata.version,
      maskPattern: decoderMetadata.maskPattern,
      eccLevel: decoderMetadata.eccLevel,
      errorsCorrected: decoderMetadata.errorsCorrected,
      erasures: decoderMetadata.erasures,
      numBits: decoderMetadata.numBits,
      orientation: decoderMetadata.orientation,
      hasStructuredAppend: decoderMetadata.hasStructuredAppend,
      byteSegmentCount: decoderMetadata.byteSegmentCount,
      totalByteLength: decoderMetadata.totalByteLength,
    });

    return {
      success: true,
      payload: code.data!,
      payloadBytes,
      version,
      moduleCount,
      eccLevel: code.eccLevel || null,
      maskPattern: code.maskPattern ?? null,
      encodingMode,
      errorsCorrected: code.errorsCorrected ?? null,
      erasures: code.erasures ?? null,
      orientation: code.orientation ?? null,
      numBits: code.numBits ?? null,
      structuredAppendSequence: code.structuredAppendSequence ?? null,
      structuredAppendParity: code.structuredAppendParity ?? null,
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
      decoderMetadata, // Include decoder metadata for debugging
    };
  } catch (err) {
    log('decode', 'ERROR: Exception during decode', { error: String(err) });
    const debugLog = flushLogBuffer();
    disableLogBuffer();
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
      debugLog,
    };
  }
}

function stringToLatin1Bytes(s: string): Uint8Array {
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) {
    out[i] = s.charCodeAt(i) & 0xff;
  }
  return out;
}

/**
 * Detect encoding mode from payload content
 */
function detectEncodingMode(
  payload: string
): 'numeric' | 'alphanumeric' | 'byte' | 'kanji' | 'mixed' | 'unknown' {
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
 * Convert RGBA pixel to grayscale, composited over white.
 * Transparent pixels are treated as light (white background).
 * This ensures transparent QR backgrounds are correctly detected.
 */
function grayAt(data: Uint8ClampedArray, idx: number): number {
  const a = data[idx + 3] / 255;
  if (a <= 0) return 255;
  if (a >= 1) return (data[idx] + data[idx + 1] + data[idx + 2]) / 3;

  const inv = 1 - a;
  const r = data[idx] * a + 255 * inv;
  const g = data[idx + 1] * a + 255 * inv;
  const b = data[idx + 2] * a + 255 * inv;
  return (r + g + b) / 3;
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
      const gray = grayAt(data, idx);
      if (gray < 128) {
        darkPixels.push(gray);
      } else {
        lightPixels.push(gray);
      }
    }
  }

  // Get average colors
  const avgDark =
    darkPixels.length > 0
      ? Math.round(darkPixels.reduce((a, b) => a + b, 0) / darkPixels.length)
      : 0;
  const avgLight =
    lightPixels.length > 0
      ? Math.round(lightPixels.reduce((a, b) => a + b, 0) / lightPixels.length)
      : 255;

  // Calculate contrast ratio
  const l1 = avgLight / 255 + 0.05;
  const l2 = avgDark / 255 + 0.05;
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
  location: QRLocationCorners,
  modulePx: number
): { top: number; right: number; bottom: number; left: number; adequate: boolean } {
  // Measure white space around the QR code in module units
  const top = Math.max(0, Math.floor(location.topLeftCorner.y / modulePx));
  const left = Math.max(0, Math.floor(location.topLeftCorner.x / modulePx));
  const bottom = Math.max(
    0,
    Math.floor((imageData.height - location.bottomLeftCorner.y) / modulePx)
  );
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
  location: QRLocationCorners,
  moduleCount: number,
  modulePx: number
): boolean[][] | undefined {
  if (moduleCount <= 0) return undefined;

  const { data, width } = imageData;

  log('matrix', 'Building module matrix', { moduleCount, modulePx: modulePx.toFixed(3) });

  // The jsQR location corners are at the CENTERS of the finder patterns
  // Top-left finder center = module position (3.5, 3.5) in the QR grid
  // Top-right finder center = module position (moduleCount - 3.5, 3.5)
  // Bottom-left finder center = module position (3.5, moduleCount - 3.5)

  const tlX = location.topLeftCorner.x;
  const tlY = location.topLeftCorner.y;
  const trX = location.topRightCorner.x;
  const trY = location.topRightCorner.y;
  const blX = location.bottomLeftCorner.x;
  const blY = location.bottomLeftCorner.y;

  // The distance from top-left to top-right center spans (moduleCount - 7) modules
  const moduleSpan = moduleCount - 7;

  if (moduleSpan <= 0) {
    log('matrix', 'ERROR: Invalid module span', { moduleSpan });
    return undefined;
  }

  // Calculate unit vectors for moving one module right and one module down
  // "Right" direction: from top-left finder to top-right finder
  const rightVecX = (trX - tlX) / moduleSpan;
  const rightVecY = (trY - tlY) / moduleSpan;

  // "Down" direction: from top-left finder to bottom-left finder
  const downVecX = (blX - tlX) / moduleSpan;
  const downVecY = (blY - tlY) / moduleSpan;

  log('matrix', 'Direction vectors (per module)', {
    right: { x: rightVecX.toFixed(3), y: rightVecY.toFixed(3) },
    down: { x: downVecX.toFixed(3), y: downVecY.toFixed(3) },
  });

  // The top-left finder center is at module grid position (3.5, 3.5)
  // To find the origin (module 0,0), we go back 3.5 modules in both directions
  const originX = tlX - 3.5 * rightVecX - 3.5 * downVecX;
  const originY = tlY - 3.5 * rightVecY - 3.5 * downVecY;

  log('matrix', 'Calculated origin (module 0,0)', {
    originX: originX.toFixed(2),
    originY: originY.toFixed(2),
  });

  // Log some sample positions for debugging
  const samplePositions = [
    { name: 'module(0,0)', col: 0, row: 0 },
    { name: 'module(3,3) - TL finder center', col: 3, row: 3 },
    { name: `module(${moduleCount - 4},3) - TR finder center`, col: moduleCount - 4, row: 3 },
    { name: `module(3,${moduleCount - 4}) - BL finder center`, col: 3, row: moduleCount - 4 },
  ];

  for (const sample of samplePositions) {
    const px = originX + (sample.col + 0.5) * rightVecX + (sample.row + 0.5) * downVecX;
    const py = originY + (sample.col + 0.5) * rightVecY + (sample.row + 0.5) * downVecY;
    log('matrix', `Sample: ${sample.name}`, {
      pixelX: px.toFixed(2),
      pixelY: py.toFixed(2),
    });
  }

  const matrix: boolean[][] = [];
  let darkCount = 0;
  let lightCount = 0;
  let outOfBoundsCount = 0;

  for (let row = 0; row < moduleCount; row++) {
    const matrixRow: boolean[] = [];
    for (let col = 0; col < moduleCount; col++) {
      // Calculate pixel position for center of this module
      // Module (col, row) is at grid position (col, row)
      // Pixel = origin + col * rightVec + row * downVec + 0.5 offset for center
      const x = Math.round(originX + (col + 0.5) * rightVecX + (row + 0.5) * downVecX);
      const y = Math.round(originY + (col + 0.5) * rightVecY + (row + 0.5) * downVecY);

      if (x >= 0 && x < imageData.width && y >= 0 && y < imageData.height) {
        const idx = (y * width + x) * 4;
        const gray = grayAt(data, idx);
        const isDark = gray < 128;
        matrixRow.push(isDark);
        if (isDark) darkCount++;
        else lightCount++;
      } else {
        matrixRow.push(false);
        outOfBoundsCount++;
      }
    }
    matrix.push(matrixRow);
  }

  log('matrix', 'Matrix statistics', {
    totalModules: moduleCount * moduleCount,
    darkModules: darkCount,
    lightModules: lightCount,
    outOfBounds: outOfBoundsCount,
    darkRatio: `${((darkCount / (darkCount + lightCount)) * 100).toFixed(1)}%`,
  });

  return matrix;
}

/**
 * Validate that finder patterns appear correctly in the matrix
 */
function validateFinderPatterns(matrix: boolean[][], moduleCount: number): void {
  // Check top-left finder pattern (should be 7x7 with specific pattern)
  // The outer ring should be dark, then white ring, then dark center 3x3

  const tlCorners = [
    { row: 0, col: 0, expected: true, name: 'TL outer corner' },
    { row: 0, col: 6, expected: true, name: 'TL outer top-right' },
    { row: 6, col: 0, expected: true, name: 'TL outer bottom-left' },
    { row: 6, col: 6, expected: true, name: 'TL outer bottom-right' },
    { row: 1, col: 1, expected: false, name: 'TL white ring' },
    { row: 3, col: 3, expected: true, name: 'TL center' },
  ];

  const trCorners = [
    { row: 0, col: moduleCount - 1, expected: true, name: 'TR outer corner' },
    { row: 0, col: moduleCount - 7, expected: true, name: 'TR outer left' },
    { row: 3, col: moduleCount - 4, expected: true, name: 'TR center' },
  ];

  const blCorners = [
    { row: moduleCount - 1, col: 0, expected: true, name: 'BL outer corner' },
    { row: moduleCount - 7, col: 0, expected: true, name: 'BL outer top' },
    { row: moduleCount - 4, col: 3, expected: true, name: 'BL center' },
  ];

  const allChecks = [...tlCorners, ...trCorners, ...blCorners];
  let correct = 0;
  let incorrect = 0;

  for (const check of allChecks) {
    const actual = matrix[check.row]?.[check.col] ?? false;
    if (actual === check.expected) {
      correct++;
    } else {
      incorrect++;
      log('validation', `MISMATCH: ${check.name}`, {
        row: check.row,
        col: check.col,
        expected: check.expected ? 'dark' : 'light',
        actual: actual ? 'dark' : 'light',
      });
    }
  }

  log('validation', 'Finder pattern validation', {
    correct,
    incorrect,
    total: allChecks.length,
    accuracy: `${((correct / allChecks.length) * 100).toFixed(1)}%`,
  });
}
