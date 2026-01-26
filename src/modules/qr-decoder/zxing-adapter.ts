/**
 * ZXing Library Adapter
 * Wraps the proven ZXing decoder to provide our existing DecodeResult interface.
 * This replaces our custom RS decoder with the battle-tested ZXing implementation.
 */

import BinaryBitmap from '../lib-zxing/BinaryBitmap';
import HybridBinarizer from '../lib-zxing/common/HybridBinarizer';
import GlobalHistogramBinarizer from '../lib-zxing/common/GlobalHistogramBinarizer';
import QRCodeReader from '../lib-zxing/qrcode/QRCodeReader';
import LuminanceSource from '../lib-zxing/LuminanceSource';
import ResultMetadataType from '../lib-zxing/ResultMetadataType';
import DecodeHintType from '../lib-zxing/DecodeHintType';
import Result from '../lib-zxing/Result';
import NotFoundException from '../lib-zxing/NotFoundException';
import FormatException from '../lib-zxing/FormatException';
import ChecksumException from '../lib-zxing/ChecksumException';
import { qrAnalyzerLog as log } from '../qr-analyzer/logger';
import { decodeQR as customDecodeQR } from './decode-qr';
import type { DecodeResult, ECCLevelChar, ZXingMetadata } from './types';

/**
 * Custom LuminanceSource for ImageData
 * Converts RGBA ImageData to grayscale luminance values
 */
class ImageDataLuminanceSource extends LuminanceSource {
  private luminances: Uint8ClampedArray;

  constructor(private imageData: ImageData) {
    super(imageData.width, imageData.height);
    
    const { data, width, height } = imageData;
    this.luminances = new Uint8ClampedArray(width * height);
    
    // Convert RGBA to grayscale, compositing over white for transparency
    for (let i = 0; i < width * height; i++) {
      const idx = i * 4;
      const a = data[idx + 3] / 255;
      
      if (a <= 0) {
        // Fully transparent = white
        this.luminances[i] = 255;
      } else if (a >= 1) {
        // Fully opaque - standard grayscale conversion
        // Use green-favoring formula for better QR detection
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        this.luminances[i] = Math.round((r + 2 * g + b) / 4);
      } else {
        // Semi-transparent - composite over white
        const inv = 1 - a;
        const r = data[idx] * a + 255 * inv;
        const g = data[idx + 1] * a + 255 * inv;
        const b = data[idx + 2] * a + 255 * inv;
        this.luminances[i] = Math.round((r + 2 * g + b) / 4);
      }
    }
  }

  getRow(y: number, row?: Uint8ClampedArray): Uint8ClampedArray {
    const width = this.getWidth();
    if (!row || row.length < width) {
      row = new Uint8ClampedArray(width);
    }
    const offset = y * width;
    for (let x = 0; x < width; x++) {
      row[x] = this.luminances[offset + x];
    }
    return row;
  }

  getMatrix(): Uint8ClampedArray {
    return this.luminances;
  }

  isCropSupported(): boolean {
    return false;
  }

  crop(): LuminanceSource {
    throw new Error('Crop not supported');
  }

  isRotateSupported(): boolean {
    return false;
  }

  rotateCounterClockwise(): LuminanceSource {
    throw new Error('Rotate not supported');
  }

  rotateCounterClockwise45(): LuminanceSource {
    throw new Error('Rotate not supported');
  }

  invert(): LuminanceSource {
    throw new Error('Invert not supported');
  }
}

/**
 * Decode QR code using ZXing library with aggressive fallback strategies
 * This is the main entry point that replaces our custom decoder
 */
export function decodeQRWithZXing(
  imageData: ImageData,
  options: { inversionAttempts?: 'dontInvert' | 'onlyInvert' | 'attemptBoth' } = {}
): DecodeResult | null {
  const { inversionAttempts = 'attemptBoth' } = options;

  // Strategy 1: Normal with TRY_HARDER (always enabled)
  const tryHarderHints = new Map<DecodeHintType, any>();
  tryHarderHints.set(DecodeHintType.TRY_HARDER, true);

  if (inversionAttempts !== 'onlyInvert') {
    log('strategy', 'Trying: Normal + TRY_HARDER');
    const result = tryDecodeWithZXing(imageData, false, tryHarderHints);
    if (result) return result;
  }

  // Strategy 2: Inverted with TRY_HARDER
  if (inversionAttempts !== 'dontInvert') {
    log('strategy', 'Trying: Inverted + TRY_HARDER');
    const result = tryDecodeWithZXing(imageData, true, tryHarderHints);
    if (result) return result;
  }

  // Strategy 3: Try with PURE_BARCODE hint (assumes clean image)
  const pureHints = new Map<DecodeHintType, any>();
  pureHints.set(DecodeHintType.TRY_HARDER, true);
  pureHints.set(DecodeHintType.PURE_BARCODE, true);

  if (inversionAttempts !== 'onlyInvert') {
    log('strategy', 'Trying: Normal + TRY_HARDER + PURE_BARCODE');
    const result = tryDecodeWithZXing(imageData, false, pureHints);
    if (result) return result;
  }

  // Strategy 4: Try with GlobalHistogramBinarizer instead of HybridBinarizer
  if (inversionAttempts !== 'onlyInvert') {
    log('strategy', 'Trying: Normal + GlobalHistogramBinarizer');
    const result = tryDecodeWithGlobalBinarizer(imageData, false, tryHarderHints);
    if (result) return result;
  }

  if (inversionAttempts !== 'dontInvert') {
    log('strategy', 'Trying: Inverted + GlobalHistogramBinarizer');
    const result = tryDecodeWithGlobalBinarizer(imageData, true, tryHarderHints);
    if (result) return result;
  }

  // Strategy 5: Fallback to our custom decoder (uses different finder pattern detection)
  log('strategy', 'Trying: Custom decoder fallback');
  const customResult = customDecodeQR(imageData, options);
  if (customResult?.success) {
    log('strategy', 'SUCCESS: Custom decoder worked!');
    return customResult;
  }

  log('strategy', 'All strategies exhausted - no QR code detected');
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
    const source: LuminanceSource = new ImageDataLuminanceSource(
      invert ? invertImageData(imageData) : imageData
    );
    const binarizer = new GlobalHistogramBinarizer(source);
    const bitmap = new BinaryBitmap(binarizer);
    const reader = new QRCodeReader();
    const result = reader.decode(bitmap, hints);
    log('zxing', 'GlobalHistogramBinarizer decode succeeded');
    return extractDecodeResult(result, imageData);
  } catch (err) {
    if (err instanceof NotFoundException) {
      log('zxing', 'GlobalHistogramBinarizer: NotFoundException', { invert });
    } else {
      log('zxing', 'GlobalHistogramBinarizer: Error', { error: String(err), invert });
    }
    return null;
  }
}

/**
 * Extract DecodeResult from ZXing Result object
 */
function extractDecodeResult(result: Result, imageData: ImageData): DecodeResult {
  const text = result.getText();
  const metadata = result.getResultMetadata();
  
  const eccLevel = (metadata?.get(ResultMetadataType.ERROR_CORRECTION_LEVEL) as ECCLevelChar) || null;
  const maskPattern = metadata?.get(ResultMetadataType.QR_MASK_PATTERN) as number | undefined ?? null;
  const versionFromMetadata = metadata?.get(ResultMetadataType.QR_VERSION) as number | undefined;
  const orientation = metadata?.get(ResultMetadataType.ORIENTATION) as number | undefined ?? null;
  const structuredAppendSequence = metadata?.get(ResultMetadataType.STRUCTURED_APPEND_SEQUENCE) as number | undefined ?? null;
  const structuredAppendParity = metadata?.get(ResultMetadataType.STRUCTURED_APPEND_PARITY) as number | undefined ?? null;

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
      bottomRightCorner: points.length >= 4 
        ? { x: points[3].getX(), y: points[3].getY() }
        : { x: points[2].getX() - points[1].getX() + points[0].getX(), 
            y: points[2].getY() - points[1].getY() + points[0].getY() },
    };
  }

  const version = typeof versionFromMetadata === 'number' && versionFromMetadata >= 1 && versionFromMetadata <= 40
    ? versionFromMetadata : null;
  const numBits = result.getNumBits() || null;
  const errorsCorrectedFromMeta = metadata?.get(ResultMetadataType.QR_ERRORS_CORRECTED) as number | undefined;
  const erasuresFromMeta = metadata?.get(ResultMetadataType.QR_ERASURES) as number | undefined;
  const errorsCorrected: number | null = typeof errorsCorrectedFromMeta === 'number' ? errorsCorrectedFromMeta : null;
  const erasures: number | null = typeof erasuresFromMeta === 'number' ? erasuresFromMeta : null;
  const encodingMode = detectEncodingMode(text);

  const zxingMetadata: ZXingMetadata = {
    version, maskPattern, eccLevel, errorsCorrected, erasures, numBits, orientation,
    structuredAppendSequence, structuredAppendParity,
    hasStructuredAppend: structuredAppendSequence !== null && structuredAppendSequence >= 0,
    byteSegmentCount: byteSegments?.length ?? 0,
    totalByteLength: dataBytes?.length ?? 0,
  };

  return {
    success: true, data: text, dataBytes, error: null, location, version, eccLevel, maskPattern,
    encodingMode, errorsCorrected, erasures, orientation, numBits,
    structuredAppendSequence, structuredAppendParity, zxingMetadata,
  };
}

/**
 * Attempt to decode a QR code from ImageData using ZXing
 * Uses the full QRCodeReader which includes Detector for finder pattern detection
 */
function tryDecodeWithZXing(
  imageData: ImageData,
  invert: boolean,
  hints?: Map<DecodeHintType, any>
): DecodeResult | null {
  const hintDesc = hints ? Array.from(hints.keys()).map(k => DecodeHintType[k]).join('+') : 'none';
  log('zxing', 'Starting ZXing decode attempt', {
    width: imageData.width,
    height: imageData.height,
    invert,
    hints: hintDesc,
  });

  try {
    // Create luminance source
    const source: LuminanceSource = new ImageDataLuminanceSource(
      invert ? invertImageData(imageData) : imageData
    );

    // Create binary bitmap using ZXing's HybridBinarizer (the proven algorithm)
    const binarizer = new HybridBinarizer(source);
    const bitmap = new BinaryBitmap(binarizer);

    // Use the full QRCodeReader which includes Detector for proper finder pattern detection
    const reader = new QRCodeReader();
    const result = reader.decode(bitmap, hints);
    log('zxing', 'QRCodeReader.decode() succeeded', { hints: hintDesc });

    // Get text content
    const text = result.getText();

    // Extract ALL metadata from ZXing Result - this is the authoritative source of truth
    const metadata = result.getResultMetadata();
    
    // ECC level from format info (authoritative)
    const eccLevel = (metadata?.get(ResultMetadataType.ERROR_CORRECTION_LEVEL) as ECCLevelChar) || null;

    // Mask pattern from format info (authoritative) - NEVER estimate this
    const maskPattern = metadata?.get(ResultMetadataType.QR_MASK_PATTERN) as number | undefined ?? null;

    // Version from format/version info (authoritative) - NEVER estimate this
    const versionFromMetadata = metadata?.get(ResultMetadataType.QR_VERSION) as number | undefined;
    
    // Orientation in degrees (if detected)
    const orientation = metadata?.get(ResultMetadataType.ORIENTATION) as number | undefined ?? null;
    
    // Structured append info
    const structuredAppendSequence = metadata?.get(ResultMetadataType.STRUCTURED_APPEND_SEQUENCE) as number | undefined ?? null;
    const structuredAppendParity = metadata?.get(ResultMetadataType.STRUCTURED_APPEND_PARITY) as number | undefined ?? null;

    // Byte segments from metadata
    const byteSegments = metadata?.get(ResultMetadataType.BYTE_SEGMENTS) as Uint8Array[] | undefined;
    let dataBytes: Uint8Array | null = null;
    if (byteSegments && byteSegments.length > 0) {
      // Concatenate all byte segments
      let totalLength = 0;
      for (const segment of byteSegments) {
        totalLength += segment.length;
      }
      dataBytes = new Uint8Array(totalLength);
      let offset = 0;
      for (const segment of byteSegments) {
        dataBytes.set(segment, offset);
        offset += segment.length;
      }
    }

    // Get result points (finder pattern corners)
    const points = result.getResultPoints();
    let location = {
      topLeftCorner: { x: 0, y: 0 },
      topRightCorner: { x: imageData.width, y: 0 },
      bottomLeftCorner: { x: 0, y: imageData.height },
      bottomRightCorner: { x: imageData.width, y: imageData.height },
    };
    
    if (points && points.length >= 3) {
      // ZXing returns points in order: bottomLeft, topLeft, topRight, [alignmentPattern]
      location = {
        bottomLeftCorner: { x: points[0].getX(), y: points[0].getY() },
        topLeftCorner: { x: points[1].getX(), y: points[1].getY() },
        topRightCorner: { x: points[2].getX(), y: points[2].getY() },
        bottomRightCorner: points.length >= 4 
          ? { x: points[3].getX(), y: points[3].getY() }
          : { x: points[2].getX() - points[1].getX() + points[0].getX(), 
              y: points[2].getY() - points[1].getY() + points[0].getY() },
      };
    }

    // Version MUST come from ZXing metadata - NEVER estimate or guess
    // If ZXing couldn't determine the version from format/version info, return null
    const version = typeof versionFromMetadata === 'number' && versionFromMetadata >= 1 && versionFromMetadata <= 40
      ? versionFromMetadata
      : null;
    
    // Get raw bytes info from result
    const numBits = result.getNumBits() || null;
    
    // Get errors corrected and erasures from metadata (if propagated)
    const errorsCorrectedFromMeta = metadata?.get(ResultMetadataType.QR_ERRORS_CORRECTED) as number | undefined;
    const erasuresFromMeta = metadata?.get(ResultMetadataType.QR_ERASURES) as number | undefined;
    const errorsCorrected: number | null = typeof errorsCorrectedFromMeta === 'number' ? errorsCorrectedFromMeta : null;
    const erasures: number | null = typeof erasuresFromMeta === 'number' ? erasuresFromMeta : null;

    // Detect encoding mode from text content
    const encodingMode = detectEncodingMode(text);

    // Build comprehensive ZXing metadata for debugging
    const zxingMetadata: ZXingMetadata = {
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

    return {
      success: true,
      data: text,
      dataBytes,
      error: null,
      location,
      version, // ONLY from ZXing metadata, never estimated
      eccLevel,
      maskPattern, // ONLY from ZXing metadata, never estimated
      encodingMode,
      errorsCorrected,
      erasures,
      orientation,
      numBits,
      structuredAppendSequence,
      structuredAppendParity,
      zxingMetadata, // Complete metadata for debugging
    };
  } catch (err) {
    // ZXing throws exceptions for various decode failures - log the specific type
    if (err instanceof NotFoundException) {
      log('zxing', 'DECODE FAILED: NotFoundException', {
        message: err.message || 'No QR code found in image',
        invert,
      });
    } else if (err instanceof FormatException) {
      log('zxing', 'DECODE FAILED: FormatException', {
        message: err.message || 'QR code format error',
        invert,
      });
    } else if (err instanceof ChecksumException) {
      log('zxing', 'DECODE FAILED: ChecksumException', {
        message: err.message || 'QR code checksum error',
        invert,
      });
    } else {
      log('zxing', 'DECODE FAILED: Unknown exception', {
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
