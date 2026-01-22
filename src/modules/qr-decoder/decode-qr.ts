/**
 * Decode QR
 * Main QR code decoding logic
 */

// Shared logger
import { qrDecoderLog as log } from '../qr-analyzer/logger';
import { decodeDataCodewordsDetailed, readCodewords, separateCodewords } from './decode';
import { calculateLocation, extractModuleMatrix } from './extract';
import { getECCLevelChar, readFormatInfo, unmaskMatrix } from './format';
import { findFinderPatterns, selectFinderPatterns } from './locate';
import type { DecodeResult } from './types';

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

    // Step 6: Unmask the matrix
    const matrix = unmaskMatrix(rawMatrix, formatInfo.maskPattern, location.moduleCount);

    // Step 7: Read codewords
    const codewords = readCodewords(matrix, location.moduleCount);
    log('main', 'Read codewords', { count: codewords.length });

    // Step 8: Separate data and error correction codewords
    const { dataCodewords } = separateCodewords(
      codewords,
      Math.round(version),
      formatInfo.eccLevel
    );

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
      maskPattern: formatInfo.maskPattern,
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
