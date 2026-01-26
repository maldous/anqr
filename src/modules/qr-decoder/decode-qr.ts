/**
 * Decode QR
 * Main QR code decoding logic
 */

// Shared logger
import { qrDecoderLog as log } from '../qr-analyzer/logger';
import { decodeDataCodewordsDetailed, readCodewords, RS_BLOCKS } from './decode';
import { correctRSCodewords } from './rs-decoder';
import { calculateLocation, extractModuleMatrix } from './extract';
import { getECCLevelChar, readFormatInfo, unmaskMatrix } from './format';
import { findFinderPatterns, selectFinderPatterns } from './locate';
import type { DecodeResult } from './types';
import { getAlignmentPatternCenters } from '../qr-spec';
import { rsRootabilityFor } from './rs-rootability';

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

/**
 * Try to decode a QR code from ImageData
 */
function tryDecode(imageData: ImageData): DecodeResult | null {
  try {
    log('main', 'Starting decode attempt', { width: imageData.width, height: imageData.height });

    // Step 1: Find finder patterns (returns patterns and the threshold used for detection)
    const { patterns, threshold } = findFinderPatterns(imageData);
    if (patterns.length < 3) {
      log('main', 'Failed: not enough finder patterns', { found: patterns.length });
      return null;
    }

    // Step 2: Select the 3 finder patterns that form the QR code
    const selected = selectFinderPatterns(patterns);
    if (!selected) {
      log('main', 'Failed: could not select valid pattern triplet');
      return null;
    }

    const [topLeft, topRight, bottomLeft] = selected;

    // Step 3: Calculate QR code location and module count
    const location = calculateLocation(topLeft, topRight, bottomLeft);
    const version = (location.moduleCount - 17) / 4;
    log('main', 'Calculated version', { version, moduleCount: location.moduleCount });

    // Step 4: Extract module matrix from image using the threshold from finder detection
    const rawMatrix = extractModuleMatrix(imageData, location, threshold);

    // Step 5: Read format info (ECC level and mask pattern)
    const formatInfo = readFormatInfo(rawMatrix, location.moduleCount);
    if (!formatInfo) {
      log('main', 'Failed: could not read format info');
      return null;
    }

    // --- Diagnostics -----------------------------------------------------
    // 2) Validate traversal on timing patterns and alignment pattern.
    // If these scores are poor, the grid mapping is still off.
    const moduleCount = location.moduleCount;
    const versionRounded = Math.round(version);

    // Timing patterns (row 6 and col 6), expected alternation.
    const timingMismatches: Array<{ r: number; c: number; exp: 0 | 1; got: 0 | 1 }> = [];
    for (let c = 8; c < moduleCount - 8; c++) {
      const exp: 0 | 1 = (c % 2 === 0 ? 1 : 0) as 0 | 1;
      const got: 0 | 1 = (rawMatrix[6]?.[c] ? 1 : 0) as 0 | 1;
      if (exp !== got && timingMismatches.length < 12) timingMismatches.push({ r: 6, c, exp, got });
    }
    for (let r = 8; r < moduleCount - 8; r++) {
      const exp: 0 | 1 = (r % 2 === 0 ? 1 : 0) as 0 | 1;
      const got: 0 | 1 = (rawMatrix[r]?.[6] ? 1 : 0) as 0 | 1;
      if (exp !== got && timingMismatches.length < 12) timingMismatches.push({ r, c: 6, exp, got });
    }
    log('diag', 'Timing pattern mismatches (first 12)', {
      count: timingMismatches.length,
      mismatches: timingMismatches.map((m) => `(${m.r},${m.c}) exp=${m.exp} got=${m.got}`),
    });

    // Alignment pattern score (5x5), expected at spec centers.
    const centers = getAlignmentPatternCenters(versionRounded, moduleCount);
    const alignmentScores: Array<{ center: string; score: string; mismatches: string[] }> = [];
    for (const center of centers) {
      const cx = center.col;
      const cy = center.row;
      // Skip centers that overlap finders (spec rule).
      if (
        (cx <= 8 && cy <= 8) ||
        (cx >= moduleCount - 9 && cy <= 8) ||
        (cx <= 8 && cy >= moduleCount - 9)
      ) {
        continue;
      }

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
      alignmentScores.push({
        center: `(${cx},${cy})`,
        score: `${good}/${total}`,
        mismatches: mism,
      });
    }
    if (alignmentScores.length) {
      log('diag', 'Alignment pattern score(s)', { version: versionRounded, scores: alignmentScores });
    } else {
      log('diag', 'Alignment pattern score(s)', { version: versionRounded, scores: 'none (v1 or finder-overlap only)' });
    }

    // 1) RS rootability across masks 0..7 (without changing anything else).
    // If exactly one mask produces "rootsFound == degree" (or far fewer non-zero syndromes),
    // the issue is format/mask selection. If none do, look at traversal or sampling/grid.
    const diagEccChar = getECCLevelChar(formatInfo.eccLevel);
    const maskSweep: any[] = [];
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
    log('diag', 'RS rootability sweep (masks 0..7)', { version: versionRounded, ecc: diagEccChar, maskSweep });
    // --------------------------------------------------------------------

    // Step 6: Unmask the matrix
    const matrix = unmaskMatrix(rawMatrix, formatInfo.maskPattern, location.moduleCount);

    // Step 7: Read codewords
    const codewords = readCodewords(matrix, location.moduleCount);
    log('main', 'Read codewords', { count: codewords.length });

    // Step 8: RS Error Correction
    // Get RS block configuration for this version/ECC
    const eccChar = getECCLevelChar(formatInfo.eccLevel) as keyof typeof RS_BLOCKS;
    const rsBlocks = RS_BLOCKS[eccChar]?.[Math.round(version) - 1];
    
    if (!rsBlocks) {
      log('main', 'Failed: No RS block configuration found', { 
        version: Math.round(version), 
        eccLevel: eccChar 
      });
      return null;
    }

    log('main', 'Starting RS error correction', {
      version: Math.round(version),
      eccLevel: eccChar,
      rsBlocks: rsBlocks.map(b => `${b[0]}x(${b[2]}d+${b[1]-b[2]}e)`).join(', '),
      totalCodewords: codewords.length,
    });

    // De-interleave and correct each RS block
    let rsResult = correctRSCodewords(codewords, rsBlocks);
    let usedMask = formatInfo.maskPattern;
    
    if (rsResult === null) {
      log('main', 'RS error correction failed with detected mask, trying fallback');
      
      // Use the rootability sweep to find a mask that produces rootable blocks
      // This helps when format info is ambiguous (copies disagreed)
      for (let testMask = 0; testMask < 8; testMask++) {
        if (testMask === formatInfo.maskPattern) continue; // Already tried
        
        const testMatrix = unmaskMatrix(rawMatrix, testMask, location.moduleCount);
        const testCodewords = readCodewords(testMatrix, location.moduleCount);
        const testRsResult = correctRSCodewords(testCodewords, rsBlocks);
        
        if (testRsResult !== null) {
          log('main', 'Mask fallback SUCCESS', { 
            originalMask: formatInfo.maskPattern, 
            workingMask: testMask,
            corrections: testRsResult.correctionsMade 
          });
          rsResult = testRsResult;
          usedMask = testMask;
          break;
        }
      }
      
      if (rsResult === null) {
        log('main', 'Failed: RS error correction failed (too many errors, all masks tried)');
        return null;
      }
    }

    const { dataCodewords, correctionsMade } = rsResult;
    
    log('main', 'RS correction completed', {
      dataCodewords: dataCodewords.length,
      correctionsMade,
      first10: dataCodewords.slice(0, 10).map(c => c.toString(16).padStart(2, '0')).join(' '),
    });

    // Step 9: Decode data
    // Use rounded version to avoid fractional char-count tables on jittery inputs
    const decoded = decodeDataCodewordsDetailed(dataCodewords, Math.round(version));
    const data = decoded.text;
    const dataBytes = decoded.bytes;
    const encodingMode = decoded.encodingMode;

    // Check if decode was valid (no truncation or corrupt segments)
    if (!decoded.valid) {
      log('main', 'Failed: decode reported invalid (truncation or corrupt data)');
      return null;
    }

    if (!data) {
      log('main', 'Failed: could not decode data');
      return null;
    }

    log('main', 'Decode SUCCESS', {
      version: Math.round(version),
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
      version: Math.round(version),
      eccLevel: getECCLevelChar(formatInfo.eccLevel),
      maskPattern: usedMask,
    };
  } catch (err) {
    log('main', 'Exception during decode', { error: String(err) });
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
