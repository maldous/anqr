/**
 * Decode QR
 * Main QR code decoding logic
 */

import { createLogger } from '../../../infra/logging/logger';
import { getAlignmentPatternCenters } from '../../../modules/qr-spec';
import { decodeDataCodewordsDetailed, RS_BLOCKS, readCodewords } from './decode';
import { calculateLocation, extractModuleMatrix } from './extract';
import { getECCLevelChar, readFormatInfo, unmaskMatrix } from './format';
import { findFinderPatterns, selectFinderPatterns } from './locate';
import { correctRSCodewords } from './rs-decoder';
import { rsRootabilityFor } from './rs-rootability';
import type { DecodeResult, ECCLevelChar } from '../../../modules/qr-decoder/types';

const qrDecoderLog = createLogger('DECODER');

/**
 * Decode a QR code from ImageData
 * This is the main entry point, replacing jsQR
 */
export function decodeQR(
  imageData: ImageData,
  options: { inversionAttempts?: 'dontInvert' | 'onlyInvert' | 'attemptBoth' } = {}
): DecodeResult | null {
  const { inversionAttempts = 'attemptBoth' } = options;

  // Try normal first
  if (inversionAttempts !== 'onlyInvert') {
    const result = tryDecode(imageData);
    if (result) return result;
  }

  // Try inverted if needed
  if (inversionAttempts !== 'dontInvert') {
    const inverted = invertImageData(imageData);
    const result = tryDecode(inverted);
    if (result) return result;
  }

  return null;
}

function checkTimingPosition(
  rawMatrix: boolean[][],
  r: number,
  c: number,
  index: number,
  mismatches: Array<{ r: number; c: number; exp: 0 | 1; got: 0 | 1 }>
): void {
  const exp: 0 | 1 = index % 2 === 0 ? 1 : 0;
  const got: 0 | 1 = rawMatrix[r]?.[c] ? 1 : 0;
  if (exp !== got && mismatches.length < 12) mismatches.push({ r, c, exp, got });
}

// Validate traversal on timing patterns.
function collectTimingDiagnostics(rawMatrix: boolean[][], moduleCount: number): void {
  const timingMismatches: Array<{ r: number; c: number; exp: 0 | 1; got: 0 | 1 }> = [];
  for (let c = 8; c < moduleCount - 8; c++) {
    checkTimingPosition(rawMatrix, 6, c, c, timingMismatches);
  }
  for (let r = 8; r < moduleCount - 8; r++) {
    checkTimingPosition(rawMatrix, r, 6, r, timingMismatches);
  }
  qrDecoderLog.trace('diag: Timing pattern mismatches (first 12)', {
    count: timingMismatches.length,
    mismatches: timingMismatches.map((m) => `(${m.r},${m.c}) exp=${m.exp} got=${m.got}`),
  });
}

function overlapsFinderRegion(cx: number, cy: number, moduleCount: number): boolean {
  return (
    (cx <= 8 && cy <= 8) || (cx >= moduleCount - 9 && cy <= 8) || (cx <= 8 && cy >= moduleCount - 9)
  );
}

function scoreAlignmentCenter(
  rawMatrix: boolean[][],
  cx: number,
  cy: number
): { good: number; total: number; mismatches: string[] } {
  let good = 0;
  let total = 0;
  const mism: string[] = [];
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const r = cy + dy;
      const c = cx + dx;
      const got = rawMatrix[r]?.[c] ? 1 : 0;
      const exp = Math.max(Math.abs(dx), Math.abs(dy)) === 2 || (dx === 0 && dy === 0) ? 1 : 0;
      total++;
      if (got === exp) good++;
      else if (mism.length < 6) mism.push(`(${r},${c}) exp=${exp} got=${got}`);
    }
  }
  return { good, total, mismatches: mism };
}

// Alignment pattern score (5x5), expected at spec centers.
function collectAlignmentDiagnostics(
  rawMatrix: boolean[][],
  moduleCount: number,
  versionRounded: number
): void {
  const centers = getAlignmentPatternCenters(versionRounded, moduleCount);
  const alignmentScores: Array<{ center: string; score: string; mismatches: string[] }> = [];
  for (const center of centers) {
    const cx = center.col;
    const cy = center.row;
    if (overlapsFinderRegion(cx, cy, moduleCount)) continue;

    const { good, total, mismatches } = scoreAlignmentCenter(rawMatrix, cx, cy);
    alignmentScores.push({
      center: `(${cx},${cy})`,
      score: `${good}/${total}`,
      mismatches,
    });
  }
  if (alignmentScores.length) {
    qrDecoderLog.trace('diag: Alignment pattern scores', {
      version: versionRounded,
      scores: alignmentScores,
    });
  } else {
    qrDecoderLog.trace('diag: Alignment pattern scores', {
      version: versionRounded,
      scores: 'none (v1 or finder-overlap only)',
    });
  }
}

// RS rootability across masks 0..7 (without changing anything else).
function runMaskRootabilitySweep(
  rawMatrix: boolean[][],
  moduleCount: number,
  versionRounded: number,
  diagEccChar: ECCLevelChar
): void {
  const maskSweep: Array<{
    mask: number;
    codewords: number;
    blocks: Array<{ b: number; nz: number; deg: number; roots: number }>;
  }> = [];
  for (let m = 0; m <= 7; m++) {
    const unmasked = unmaskMatrix(rawMatrix, m, moduleCount);
    const cw = readCodewords(unmasked, moduleCount);
    const rs = rsRootabilityFor(cw, versionRounded, diagEccChar);
    maskSweep.push({
      mask: m,
      codewords: cw.length,
      blocks: rs.map((b) => ({
        b: b.blockIndex,
        nz: b.syndromeNonZeroCount,
        deg: b.bmDegree,
        roots: b.chienRootsFound,
      })),
    });
  }
  qrDecoderLog.trace('diag: RS rootability sweep (masks 0..7)', {
    version: versionRounded,
    ecc: diagEccChar,
    maskSweep,
  });
}

// Attempt RS correction with mask fallback.
function attemptRSCorrectionWithFallback(
  rawMatrix: boolean[][],
  moduleCount: number,
  rsBlocks: number[][],
  formatMaskPattern: number
): { rsResult: { dataCodewords: number[]; correctionsMade: number }; usedMask: number } | null {
  const matrix = unmaskMatrix(rawMatrix, formatMaskPattern, moduleCount);
  const codewords = readCodewords(matrix, moduleCount);
  qrDecoderLog.trace('main: Read codewords', { count: codewords.length });

  let rsResult = correctRSCodewords(codewords, rsBlocks);
  let usedMask = formatMaskPattern;

  if (rsResult === null) {
    qrDecoderLog.trace('main: RS error correction failed with detected mask, trying fallback');

    for (let testMask = 0; testMask < 8; testMask++) {
      if (testMask === formatMaskPattern) continue;

      const testMatrix = unmaskMatrix(rawMatrix, testMask, moduleCount);
      const testCodewords = readCodewords(testMatrix, moduleCount);
      const testRsResult = correctRSCodewords(testCodewords, rsBlocks);

      if (testRsResult !== null) {
        qrDecoderLog.trace('main: Mask fallback SUCCESS', {
          originalMask: formatMaskPattern,
          workingMask: testMask,
          corrections: testRsResult.correctionsMade,
        });
        rsResult = testRsResult;
        usedMask = testMask;
        break;
      }
    }

    if (rsResult === null) {
      qrDecoderLog.trace(
        'main: Failed - RS error correction failed (too many errors, all masks tried)'
      );
      return null;
    }
  }

  return { rsResult, usedMask };
}

/**
 * Try to decode a QR code from ImageData
 */
function tryDecode(imageData: ImageData): DecodeResult | null {
  try {
    qrDecoderLog.trace('main: Starting decode attempt', {
      width: imageData.width,
      height: imageData.height,
    });

    // Step 1: Find finder patterns (returns patterns and the threshold used for detection)
    const { patterns, threshold } = findFinderPatterns(imageData);
    if (patterns.length < 3) {
      qrDecoderLog.trace('main: Failed - not enough finder patterns', { found: patterns.length });
      return null;
    }

    // Step 2: Select the 3 finder patterns that form the QR code
    const selected = selectFinderPatterns(patterns);
    if (!selected) {
      qrDecoderLog.trace('main: Failed - could not select valid pattern triplet');
      return null;
    }

    const [topLeft, topRight, bottomLeft] = selected;

    // Step 3: Calculate QR code location and module count
    const location = calculateLocation(topLeft, topRight, bottomLeft);
    const version = (location.moduleCount - 17) / 4;
    qrDecoderLog.trace('main: Calculated version', { version, moduleCount: location.moduleCount });

    // Step 4: Extract module matrix from image using the threshold from finder detection
    const rawMatrix = extractModuleMatrix(imageData, location, threshold);

    // Step 5: Read format info (ECC level and mask pattern)
    const formatInfo = readFormatInfo(rawMatrix, location.moduleCount);
    if (!formatInfo) {
      qrDecoderLog.trace('main: Failed - could not read format info');
      return null;
    }

    const moduleCount = location.moduleCount;
    const versionRounded = Math.round(version);

    // --- Diagnostics ---
    collectTimingDiagnostics(rawMatrix, moduleCount);
    collectAlignmentDiagnostics(rawMatrix, moduleCount, versionRounded);
    runMaskRootabilitySweep(
      rawMatrix,
      moduleCount,
      versionRounded,
      getECCLevelChar(formatInfo.eccLevel)
    );

    // Step 6-8: Unmask, read codewords, RS error correction
    const eccChar = getECCLevelChar(formatInfo.eccLevel) as keyof typeof RS_BLOCKS;
    const rsBlocks = RS_BLOCKS[eccChar]?.[versionRounded - 1];

    if (!rsBlocks) {
      qrDecoderLog.trace('main: Failed - No RS block configuration found', {
        version: versionRounded,
        eccLevel: eccChar,
      });
      return null;
    }

    qrDecoderLog.trace('main: Starting RS error correction', {
      version: versionRounded,
      eccLevel: eccChar,
      rsBlocks: rsBlocks.map((b) => `${b[0]}x(${b[2]}d+${b[1] - b[2]}e)`).join(', '),
    });

    const correctionResult = attemptRSCorrectionWithFallback(
      rawMatrix,
      moduleCount,
      rsBlocks,
      formatInfo.maskPattern
    );
    if (!correctionResult) return null;

    const {
      rsResult: { dataCodewords, correctionsMade },
      usedMask,
    } = correctionResult;

    qrDecoderLog.trace('main: RS correction completed', {
      dataCodewords: dataCodewords.length,
      correctionsMade,
      first10: dataCodewords
        .slice(0, 10)
        .map((c) => c.toString(16).padStart(2, '0'))
        .join(' '),
    });

    // Step 9: Decode data
    const decoded = decodeDataCodewordsDetailed(dataCodewords, versionRounded);
    const data = decoded.text;
    const dataBytes = decoded.bytes;
    const encodingMode = decoded.encodingMode;

    if (!decoded.valid) {
      qrDecoderLog.trace('main: Failed - decode reported invalid (truncation or corrupt data)', {
        structurallyValid: decoded.structurallyValid,
        segmentCount: decoded.segmentCount,
        segments: decoded.segments.map((s) => ({
          mode: s.modeName,
          valid: s.valid,
          charCount: s.charCount,
        })),
      });
      return null;
    }

    if (!data) {
      qrDecoderLog.trace('main: Failed - could not decode data');
      return null;
    }

    qrDecoderLog.trace('main: Decode SUCCESS', {
      version: versionRounded,
      eccLevel: getECCLevelChar(formatInfo.eccLevel),
      dataLength: data.length,
      dataPreview: data.slice(0, 50),
    });

    return {
      success: true,
      data,
      dataBytes,
      encodingMode,
      error: null,
      location: {
        topLeftCorner: topLeft.center,
        topRightCorner: topRight.center,
        bottomLeftCorner: bottomLeft.center,
        bottomRightCorner: location.bottomRight,
      },
      version: versionRounded,
      eccLevel: getECCLevelChar(formatInfo.eccLevel),
      maskPattern: usedMask,
      structurallyValid: decoded.structurallyValid,
      segmentCount: decoded.segmentCount,
      segments: decoded.segments,
    };
  } catch (err) {
    qrDecoderLog.trace('main: Exception during decode', { error: String(err) });
    return null;
  }
}

/**
 * Invert the colors in ImageData for trying inverted QR codes
 */
function invertImageData(imageData: ImageData): ImageData {
  const data = new Uint8ClampedArray(imageData.data.length);

  for (let i = 0; i < imageData.data.length; i += 4) {
    data[i] = 255 - imageData.data[i];
    data[i + 1] = 255 - imageData.data[i + 1];
    data[i + 2] = 255 - imageData.data[i + 2];
    data[i + 3] = imageData.data[i + 3]; // Keep alpha
  }

  return new ImageData(data, imageData.width, imageData.height);
}
