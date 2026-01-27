/**
 * QR Decoder Reader
 * Main entry point for QR code decoding
 */

import { BitMatrix } from './bit-matrix';
import { BinaryBitmap, RGBALuminanceSource } from './luminance';
import { HybridBinarizer, GlobalHistogramBinarizer } from './binarizer';
import { Detector, DetectorResult } from './qr-detector';
import { QRDecoder } from './qr-data-decoder';
import { Result, ResultPoint, BarcodeFormat, DecodeHintType, DecoderResult, ResultMetadataType } from './result-types';
import { NotFoundException, FormatException, ChecksumException } from './exceptions';

/**
 * QR Code Reader - main decoder class
 */
export class Reader {
  private decoder = new QRDecoder();

  /**
   * Decode a QR code from a BinaryBitmap
   */
  decode(image: BinaryBitmap, hints?: Map<DecodeHintType, any>): Result {
    let decoderResult: DecoderResult;
    let points: ResultPoint[];

    if (hints?.get(DecodeHintType.PURE_BARCODE)) {
      const bits = this.extractPureBits(image.getBlackMatrix());
      decoderResult = this.decoder.decode(bits, hints);
      points = [];
    } else {
      const detectorResult = new Detector(image.getBlackMatrix()).detect(hints);
      decoderResult = this.decoder.decode(detectorResult.getBits(), hints);
      points = detectorResult.getPoints();
    }

    // If mirrored, reverse the points
    if (decoderResult.getOther() instanceof QRCodeDecoderMetaData) {
      (decoderResult.getOther() as QRCodeDecoderMetaData).applyMirroredCorrection(points);
    }

    const result = new Result(
      decoderResult.getText(),
      decoderResult.getRawBytes(),
      undefined,
      points,
      BarcodeFormat.QR_CODE,
      Date.now()
    );

    const byteSegments = decoderResult.getByteSegments();
    if (byteSegments) {
      result.putMetadata(ResultMetadataType.BYTE_SEGMENTS, byteSegments);
    }

    const ecLevel = decoderResult.getECLevel();
    if (ecLevel) {
      result.putMetadata(ResultMetadataType.ERROR_CORRECTION_LEVEL, ecLevel);
    }

    if (decoderResult.hasStructuredAppend()) {
      result.putMetadata(
        ResultMetadataType.STRUCTURED_APPEND_SEQUENCE,
        decoderResult.getStructuredAppendSequenceNumber()
      );
      result.putMetadata(
        ResultMetadataType.STRUCTURED_APPEND_PARITY,
        decoderResult.getStructuredAppendParity()
      );
    }

    result.putMetadata(ResultMetadataType.SYMBOLOGY_IDENTIFIER, decoderResult.getSymbologyModifier());

    const version = decoderResult.getVersion();
    if (version !== null) {
      result.putMetadata(ResultMetadataType.QR_VERSION, version);
    }

    const maskPattern = decoderResult.getMaskPattern();
    if (maskPattern !== null) {
      result.putMetadata(ResultMetadataType.QR_MASK_PATTERN, maskPattern);
    }

    return result;
  }

  /**
   * Reset decoder state
   */
  reset(): void {
    // Nothing to reset
  }

  /**
   * Extract pure bits from a perfectly aligned QR code image
   */
  private extractPureBits(image: BitMatrix): BitMatrix {
    const leftTopBlack = image.getTopLeftOnBit();
    const rightBottomBlack = image.getBottomRightOnBit();

    if (!leftTopBlack || !rightBottomBlack) {
      throw NotFoundException.getNotFoundInstance();
    }

    const moduleSize = this.moduleSize(leftTopBlack, image);

    let top = leftTopBlack[1];
    let bottom = rightBottomBlack[1];
    let left = leftTopBlack[0];
    let right = rightBottomBlack[0];

    // Adjust if corners land in quiet zone
    if (left >= right || top >= bottom) {
      throw NotFoundException.getNotFoundInstance();
    }

    // Check edges of finder patterns for square alignment
    if (bottom - top !== right - left) {
      right = left + (bottom - top);
      if (right >= image.getWidth()) {
        throw NotFoundException.getNotFoundInstance();
      }
    }

    const matrixWidth = Math.round((right - left + 1) / moduleSize);
    const matrixHeight = Math.round((bottom - top + 1) / moduleSize);

    if (matrixWidth <= 0 || matrixHeight <= 0) {
      throw NotFoundException.getNotFoundInstance();
    }

    if (matrixHeight !== matrixWidth) {
      throw NotFoundException.getNotFoundInstance();
    }

    // Push to middle of module
    const nudge = Math.floor(moduleSize / 2);
    top += nudge;
    left += nudge;

    // Sample the image
    const bits = new BitMatrix(matrixWidth, matrixHeight);

    for (let y = 0; y < matrixHeight; y++) {
      const iOffset = top + Math.floor(y * moduleSize);
      for (let x = 0; x < matrixWidth; x++) {
        if (image.get(left + Math.floor(x * moduleSize), iOffset)) {
          bits.set(x, y);
        }
      }
    }

    return bits;
  }

  private moduleSize(leftTopBlack: Int32Array, image: BitMatrix): number {
    const height = image.getHeight();
    const width = image.getWidth();
    let x = leftTopBlack[0];
    let y = leftTopBlack[1];

    let inBlack = true;
    let transitions = 0;

    while (x < width && y < height) {
      if (inBlack !== image.get(x, y)) {
        if (++transitions === 5) {
          break;
        }
        inBlack = !inBlack;
      }
      x++;
      y++;
    }

    if (x === width || y === height) {
      throw NotFoundException.getNotFoundInstance();
    }

    return (x - leftTopBlack[0]) / 7;
  }
}

/**
 * Metadata holder for QR code decoder information
 */
export class QRCodeDecoderMetaData {
  constructor(private mirrored: boolean) {}

  isMirrored(): boolean {
    return this.mirrored;
  }

  applyMirroredCorrection(points: ResultPoint[]): void {
    if (!this.mirrored || !points || points.length < 3) {
      return;
    }
    // Swap bottom-left and top-right points
    const temp = points[0];
    points[0] = points[2];
    points[2] = temp;
  }
}


