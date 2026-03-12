/**
 * QR Decoder Adapter
 * Provides DecodeResult interface using consolidated decoder modules.
 */

import { createLogger } from '../../../infra/logging/logger';

const qrDecoderLog = createLogger('DECODER');

import { GlobalHistogramBinarizer, HybridBinarizer } from './binarizer';
import { decodeQR as customDecodeQR } from './decode-qr';
import { ChecksumException, FormatException, NotFoundException } from './exceptions';
import { BinaryBitmap, type LuminanceSource, RGBALuminanceSource } from './luminance';
import { Reader } from './reader';
import { DecodeHintType, type Result, ResultMetadataType } from './result-types';
import type { DecodeResult, DecoderMetadata, ECCLevelChar } from '../../../modules/qr-decoder/types';

/**
 * Create luminance source from ImageData with transparency handling
 */
function createLuminanceSource(imageData: ImageData): LuminanceSource {
  const { data, width, height } = imageData;
  const luminances = new Uint8ClampedArray(width * height);

  // Convert RGBA to grayscale, compositing over white for transparency
  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    const a = data[idx + 3] / 255;

    if (a <= 0) {
      // Fully transparent = white
      luminances[i] = 255;
    } else if (a >= 1) {
      // Fully opaque - standard grayscale conversion
      // Use green-favoring formula for better QR detection
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      luminances[i] = Math.round((r + 2 * g + b) / 4);
    } else {
      // Semi-transparent - composite over white
      const inv = 1 - a;
      const r = data[idx] * a + 255 * inv;
      const g = data[idx + 1] * a + 255 * inv;
      const b = data[idx + 2] * a + 255 * inv;
      luminances[i] = Math.round((r + 2 * g + b) / 4);
    }
  }

  return new RGBALuminanceSource(luminances, width, height);
}

/**
 * Decode QR code with aggressive fallback strategies
 * This is the main entry point for QR decoding
 */
export function decodeQR(
  imageData: ImageData,
  options: { inversionAttempts?: 'dontInvert' | 'onlyInvert' | 'attemptBoth' } = {}
): DecodeResult | null {
  const { inversionAttempts = 'attemptBoth' } = options;

  // Strategy 1: Normal with TRY_HARDER (always enabled)
  const tryHarderHints = new Map<DecodeHintType, any>();
  tryHarderHints.set(DecodeHintType.TRY_HARDER, true);

  if (inversionAttempts !== 'onlyInvert') {
    qrDecoderLog.trace('strategy: Trying Normal + TRY_HARDER');
    const result = tryDecode(imageData, false, tryHarderHints);
    if (result) return result;
  }

  // Strategy 2: Inverted with TRY_HARDER
  if (inversionAttempts !== 'dontInvert') {
    qrDecoderLog.trace('strategy: Trying Inverted + TRY_HARDER');
    const result = tryDecode(imageData, true, tryHarderHints);
    if (result) return result;
  }

  // Strategy 3: Try with PURE_BARCODE hint (assumes clean image)
  const pureHints = new Map<DecodeHintType, any>();
  pureHints.set(DecodeHintType.TRY_HARDER, true);
  pureHints.set(DecodeHintType.PURE_BARCODE, true);

  if (inversionAttempts !== 'onlyInvert') {
    qrDecoderLog.trace('strategy: Trying Normal + TRY_HARDER + PURE_BARCODE');
    const result = tryDecode(imageData, false, pureHints);
    if (result) return result;
  }

  // Strategy 4: Try with GlobalHistogramBinarizer instead of HybridBinarizer
  const globalResult = tryGlobalBinarizerStrategies(imageData, inversionAttempts, tryHarderHints);
  if (globalResult) return globalResult;

  // Strategy 5: Fallback to our custom decoder (uses different finder pattern detection)
  qrDecoderLog.trace('strategy: Trying Custom decoder fallback');
  const customResult = customDecodeQR(imageData, options);
  if (customResult?.success) {
    qrDecoderLog.trace('strategy: SUCCESS - Custom decoder worked');
    return customResult;
  }

  qrDecoderLog.trace('strategy: All strategies exhausted - no QR code detected');
  return null;
}

function tryGlobalBinarizerStrategies(
  imageData: ImageData,
  inversionAttempts: string,
  hints: Map<DecodeHintType, any>
): DecodeResult | null {
  if (inversionAttempts !== 'onlyInvert') {
    qrDecoderLog.trace('strategy: Trying Normal + GlobalHistogramBinarizer');
    const result = tryDecodeWithGlobalBinarizer(imageData, false, hints);
    if (result) return result;
  }
  if (inversionAttempts !== 'dontInvert') {
    qrDecoderLog.trace('strategy: Trying Inverted + GlobalHistogramBinarizer');
    const result = tryDecodeWithGlobalBinarizer(imageData, true, hints);
    if (result) return result;
  }
  return null;
}

/**
 * Try decode with GlobalHistogramBinarizer (simpler threshold, may work better for some images)
 */
function tryDecodeWithGlobalBinarizer(
  imageData: ImageData,
  invert: boolean,
  hints?: Map<DecodeHintType, any>
): DecodeResult | null {
  try {
    const source = createLuminanceSource(invert ? invertImageData(imageData) : imageData);
    const binarizer = new GlobalHistogramBinarizer(source);
    const bitmap = new BinaryBitmap(binarizer);
    const reader = new Reader();
    const result = reader.decode(bitmap, hints);
    qrDecoderLog.trace('decoder: GlobalHistogramBinarizer decode succeeded');
    return extractDecodeResult(result, imageData);
  } catch (err) {
    if (err instanceof NotFoundException) {
      qrDecoderLog.trace('decoder: GlobalHistogramBinarizer NotFoundException', { invert });
    } else {
      qrDecoderLog.trace('decoder: GlobalHistogramBinarizer Error', { error: String(err), invert });
    }
    return null;
  }
}

/**
 * Extract DecodeResult from decoder Result object
 */
function extractDecodeResult(result: Result, imageData: ImageData): DecodeResult {
  const text = result.getText();
  const metadata = result.getResultMetadata();

  const eccLevel =
    (metadata?.get(ResultMetadataType.ERROR_CORRECTION_LEVEL) as ECCLevelChar) || null;
  const maskPattern =
    (metadata?.get(ResultMetadataType.QR_MASK_PATTERN) as number | undefined) ?? null;
  const versionFromMetadata = metadata?.get(ResultMetadataType.QR_VERSION) as number | undefined;
  const orientation = (metadata?.get(ResultMetadataType.ORIENTATION) as number | undefined) ?? null;
  const structuredAppendSequence =
    (metadata?.get(ResultMetadataType.STRUCTURED_APPEND_SEQUENCE) as number | undefined) ?? null;
  const structuredAppendParity =
    (metadata?.get(ResultMetadataType.STRUCTURED_APPEND_PARITY) as number | undefined) ?? null;

  const byteSegments = metadata?.get(ResultMetadataType.BYTE_SEGMENTS) as Uint8Array[] | undefined;
  let dataBytes: Uint8Array | null = null;
  if (byteSegments && byteSegments.length > 0) {
    let totalLength = 0;
    for (const segment of byteSegments) totalLength += segment.length;
    dataBytes = new Uint8Array(totalLength);
    let offset = 0;
    for (const segment of byteSegments) {
      dataBytes.set(segment, offset);
      offset += segment.length;
    }
  }

  const points = result.getResultPoints();
  let location = {
    topLeftCorner: { x: 0, y: 0 },
    topRightCorner: { x: imageData.width, y: 0 },
    bottomLeftCorner: { x: 0, y: imageData.height },
    bottomRightCorner: { x: imageData.width, y: imageData.height },
  };
  if (points && points.length >= 3) {
    location = {
      bottomLeftCorner: { x: points[0].getX(), y: points[0].getY() },
      topLeftCorner: { x: points[1].getX(), y: points[1].getY() },
      topRightCorner: { x: points[2].getX(), y: points[2].getY() },
      bottomRightCorner:
        points.length >= 4
          ? { x: points[3].getX(), y: points[3].getY() }
          : {
              x: points[2].getX() - points[1].getX() + points[0].getX(),
              y: points[2].getY() - points[1].getY() + points[0].getY(),
            },
    };
  }

  const version =
    typeof versionFromMetadata === 'number' && versionFromMetadata >= 1 && versionFromMetadata <= 40
      ? versionFromMetadata
      : null;
  const numBits = result.getNumBits() || null;
  const errorsCorrectedFromMeta = metadata?.get(ResultMetadataType.QR_ERRORS_CORRECTED) as
    | number
    | undefined;
  const erasuresFromMeta = metadata?.get(ResultMetadataType.QR_ERASURES) as number | undefined;
  const errorsCorrected: number | null =
    typeof errorsCorrectedFromMeta === 'number' ? errorsCorrectedFromMeta : null;
  const erasures: number | null = typeof erasuresFromMeta === 'number' ? erasuresFromMeta : null;
  const encodingMode = detectEncodingMode(text);

  const decoderMetadata: DecoderMetadata = {
    version,
    maskPattern,
    eccLevel,
    errorsCorrected,
    erasures,
    numBits,
    orientation,
    structuredAppendSequence,
    structuredAppendParity,
    hasStructuredAppend: structuredAppendSequence !== null && structuredAppendSequence >= 0,
    byteSegmentCount: byteSegments?.length ?? 0,
    totalByteLength: dataBytes?.length ?? 0,
  };

  // Note: The ZXing-style decoder doesn't expose segment-level info the same way
  // our custom decoder does. We set structurallyValid=true since ZXing would have
  // thrown an exception if segment parsing failed.
  return {
    success: true,
    data: text,
    dataBytes,
    error: null,
    location,
    version,
    eccLevel,
    maskPattern,
    encodingMode,
    errorsCorrected,
    erasures,
    orientation,
    numBits,
    structuredAppendSequence,
    structuredAppendParity,
    decoderMetadata,
    structurallyValid: true, // ZXing decoder would have failed if segments were corrupt
    segmentCount: byteSegments?.length ?? 1, // Approximate from byte segments
    segments: undefined, // Not available from ZXing decoder
  };
}

/**
 * Attempt to decode a QR code from ImageData
 * Uses the full Reader which includes Detector for finder pattern detection
 */
function tryDecode(
  imageData: ImageData,
  invert: boolean,
  hints?: Map<DecodeHintType, any>
): DecodeResult | null {
  const hintDesc = hints
    ? Array.from(hints.keys())
        .map((k) => DecodeHintType[k])
        .join('+')
    : 'none';
  qrDecoderLog.trace('decoder: Starting decode attempt', {
    width: imageData.width,
    height: imageData.height,
    invert,
    hints: hintDesc,
  });

  try {
    // Create luminance source
    const source = createLuminanceSource(invert ? invertImageData(imageData) : imageData);

    // Create binary bitmap using HybridBinarizer (proven algorithm)
    const binarizer = new HybridBinarizer(source);
    const bitmap = new BinaryBitmap(binarizer);

    // Use the full QRCodeReader which includes Detector for proper finder pattern detection
    const reader = new Reader();
    const result = reader.decode(bitmap, hints);
    qrDecoderLog.trace('decoder: Reader.decode() succeeded', { hints: hintDesc });
    return extractDecodeResult(result, imageData);
  } catch (err) {
    // Decoder throws exceptions for various decode failures - log the specific type
    if (err instanceof NotFoundException) {
      qrDecoderLog.trace('decoder: DECODE FAILED - NotFoundException', {
        message: err.message || 'No QR code found in image',
        invert,
      });
    } else if (err instanceof FormatException) {
      qrDecoderLog.trace('decoder: DECODE FAILED - FormatException', {
        message: err.message || 'QR code format error',
        invert,
      });
    } else if (err instanceof ChecksumException) {
      qrDecoderLog.trace('decoder: DECODE FAILED - ChecksumException', {
        message: err.message || 'QR code checksum error',
        invert,
      });
    } else {
      qrDecoderLog.trace('decoder: DECODE FAILED - Unknown exception', {
        errorType: err?.constructor?.name || 'Unknown',
        message: err instanceof Error ? err.message : String(err),
        invert,
      });
    }
    return null;
  }
}

/**
 * Detect encoding mode from decoded text
 */
function detectEncodingMode(
  text: string
): 'numeric' | 'alphanumeric' | 'byte' | 'kanji' | 'mixed' | 'unknown' {
  if (/^\d+$/.test(text)) return 'numeric';
  if (/^[0-9A-Z $%*+\-./:]+$/.test(text)) return 'alphanumeric';
  // Check for Japanese characters (Kanji/Hiragana/Katakana)
  if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text)) return 'kanji';
  return 'byte';
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
