/**
 * QR Decoder Result Types
 * Result, ResultPoint, and related types for decode results
 */

import { createLogger } from '../../lib/logger';
import { MathUtils } from './perspective';
import { arraycopy, currentTimeMillis, Float } from './util';

const _log = createLogger('DECODER');

/**
 * Barcode format enum
 */
export enum BarcodeFormat {
  QR_CODE = 'QR_CODE',
  DATA_MATRIX = 'DATA_MATRIX',
  AZTEC = 'AZTEC',
  PDF_417 = 'PDF_417',
  EAN_8 = 'EAN_8',
  EAN_13 = 'EAN_13',
  UPC_A = 'UPC_A',
  UPC_E = 'UPC_E',
  CODE_39 = 'CODE_39',
  CODE_93 = 'CODE_93',
  CODE_128 = 'CODE_128',
  ITF = 'ITF',
  RSS_14 = 'RSS_14',
  RSS_EXPANDED = 'RSS_EXPANDED',
  CODABAR = 'CODABAR',
  MAXICODE = 'MAXICODE',
}

/**
 * Metadata types that can be attached to decode results
 */
export enum ResultMetadataType {
  OTHER = 0,
  ORIENTATION = 1,
  BYTE_SEGMENTS = 2,
  ERROR_CORRECTION_LEVEL = 3,
  ISSUE_NUMBER = 4,
  SUGGESTED_PRICE = 5,
  POSSIBLE_COUNTRY = 6,
  UPC_EAN_EXTENSION = 7,
  PDF417_EXTRA_METADATA = 8,
  STRUCTURED_APPEND_SEQUENCE = 9,
  STRUCTURED_APPEND_PARITY = 10,
  SYMBOLOGY_IDENTIFIER = 11,
  QR_MASK_PATTERN = 12,
  QR_VERSION = 13,
  QR_ERRORS_CORRECTED = 14,
  QR_ERASURES = 15,
}

/**
 * Hints for the decode process
 */
export enum DecodeHintType {
  OTHER = 0,
  PURE_BARCODE = 1,
  POSSIBLE_FORMATS = 2,
  TRY_HARDER = 3,
  CHARACTER_SET = 4,
  ALLOWED_LENGTHS = 5,
  ASSUME_CODE_39_CHECK_DIGIT = 6,
  ASSUME_GS1 = 7,
  RETURN_CODABAR_START_END = 8,
  NEED_RESULT_POINT_CALLBACK = 9,
  ALLOWED_EAN_EXTENSIONS = 10,
}

/**
 * Represents a point of interest in an image
 */
export class ResultPoint {
  constructor(
    private x: number,
    private y: number
  ) {}

  getX(): number {
    return this.x;
  }

  getY(): number {
    return this.y;
  }

  equals(other: any): boolean {
    if (other instanceof ResultPoint) {
      return this.x === other.x && this.y === other.y;
    }
    return false;
  }

  hashCode(): number {
    return 31 * Float.floatToIntBits(this.x) + Float.floatToIntBits(this.y);
  }

  toString(): string {
    return `(${this.x},${this.y})`;
  }

  static orderBestPatterns(patterns: ResultPoint[]): void {
    const zeroOneDistance = ResultPoint.distance(patterns[0], patterns[1]);
    const oneTwoDistance = ResultPoint.distance(patterns[1], patterns[2]);
    const zeroTwoDistance = ResultPoint.distance(patterns[0], patterns[2]);

    let pointA: ResultPoint;
    let pointB: ResultPoint;
    let pointC: ResultPoint;

    if (oneTwoDistance >= zeroOneDistance && oneTwoDistance >= zeroTwoDistance) {
      pointB = patterns[0];
      pointA = patterns[1];
      pointC = patterns[2];
    } else if (zeroTwoDistance >= oneTwoDistance && zeroTwoDistance >= zeroOneDistance) {
      pointB = patterns[1];
      pointA = patterns[0];
      pointC = patterns[2];
    } else {
      pointB = patterns[2];
      pointA = patterns[0];
      pointC = patterns[1];
    }

    if (ResultPoint.crossProductZ(pointA, pointB, pointC) < 0) {
      const temp = pointA;
      pointA = pointC;
      pointC = temp;
    }

    patterns[0] = pointA;
    patterns[1] = pointB;
    patterns[2] = pointC;
  }

  static distance(pattern1: ResultPoint, pattern2: ResultPoint): number {
    return MathUtils.distance(pattern1.x, pattern1.y, pattern2.x, pattern2.y);
  }

  private static crossProductZ(
    pointA: ResultPoint,
    pointB: ResultPoint,
    pointC: ResultPoint
  ): number {
    const bX = pointB.x;
    const bY = pointB.y;
    return (pointC.x - bX) * (pointA.y - bY) - (pointC.y - bY) * (pointA.x - bX);
  }
}

/**
 * Encapsulates the result of decoding a barcode
 */
export class Result {
  private resultMetadata: Map<ResultMetadataType, any> | null = null;

  constructor(
    private text: string,
    private rawBytes: Uint8Array,
    private numBits: number = rawBytes == null ? 0 : 8 * rawBytes.length,
    private resultPoints: ResultPoint[],
    private format: BarcodeFormat,
    private timestamp: number = currentTimeMillis()
  ) {
    if (numBits === undefined || numBits === null) {
      this.numBits = rawBytes === null || rawBytes === undefined ? 0 : 8 * rawBytes.length;
    }
    if (timestamp === undefined || timestamp === null) {
      this.timestamp = currentTimeMillis();
    }
  }

  getText(): string {
    return this.text;
  }

  getRawBytes(): Uint8Array {
    return this.rawBytes;
  }

  getNumBits(): number {
    return this.numBits;
  }

  getResultPoints(): ResultPoint[] {
    return this.resultPoints;
  }

  getBarcodeFormat(): BarcodeFormat {
    return this.format;
  }

  getResultMetadata(): Map<ResultMetadataType, any> | null {
    return this.resultMetadata;
  }

  putMetadata(type: ResultMetadataType, value: any): void {
    this.resultMetadata ??= new Map();
    this.resultMetadata.set(type, value);
  }

  putAllMetadata(metadata: Map<ResultMetadataType, any> | null): void {
    if (metadata !== null) {
      if (this.resultMetadata === null) {
        this.resultMetadata = metadata;
      } else {
        this.resultMetadata = new Map(metadata);
      }
    }
  }

  addResultPoints(newPoints: ResultPoint[]): void {
    const oldPoints = this.resultPoints;
    if (oldPoints === null) {
      this.resultPoints = newPoints;
    } else if (newPoints !== null && newPoints.length > 0) {
      const allPoints = new Array<ResultPoint>(oldPoints.length + newPoints.length);
      arraycopy(oldPoints, 0, allPoints, 0, oldPoints.length);
      arraycopy(newPoints, 0, allPoints, oldPoints.length, newPoints.length);
      this.resultPoints = allPoints;
    }
  }

  getTimestamp(): number {
    return this.timestamp;
  }

  toString(): string {
    return this.text;
  }
}

/**
 * Decoded bit stream result
 */
export class DecoderResult {
  private numBits: number;
  private errorsCorrected: number | null = null;
  private erasures: number | null = null;
  private other: any = null;
  private structuredAppendParity: number = -1;
  private structuredAppendSequenceNumber: number = -1;
  private symbologyModifier: number = 0;
  private version: number | null = null;
  private maskPattern: number | null = null;

  constructor(
    private rawBytes: Uint8Array,
    private text: string,
    private byteSegments: Uint8Array[] | null,
    private ecLevel: string | null,
    numBits?: number
  ) {
    this.numBits = numBits ?? (rawBytes == null ? 0 : 8 * rawBytes.length);
  }

  getRawBytes(): Uint8Array {
    return this.rawBytes;
  }

  getNumBits(): number {
    return this.numBits;
  }

  setNumBits(numBits: number): void {
    this.numBits = numBits;
  }

  getText(): string {
    return this.text;
  }

  getByteSegments(): Uint8Array[] | null {
    return this.byteSegments;
  }

  getECLevel(): string | null {
    return this.ecLevel;
  }

  getErrorsCorrected(): number | null {
    return this.errorsCorrected;
  }

  setErrorsCorrected(errorsCorrected: number): void {
    this.errorsCorrected = errorsCorrected;
  }

  getErasures(): number | null {
    return this.erasures;
  }

  setErasures(erasures: number): void {
    this.erasures = erasures;
  }

  getOther(): any {
    return this.other;
  }

  setOther(other: any): void {
    this.other = other;
  }

  hasStructuredAppend(): boolean {
    return this.structuredAppendParity >= 0 && this.structuredAppendSequenceNumber >= 0;
  }

  getStructuredAppendParity(): number {
    return this.structuredAppendParity;
  }

  getStructuredAppendSequenceNumber(): number {
    return this.structuredAppendSequenceNumber;
  }

  setStructuredAppendParity(parity: number): void {
    this.structuredAppendParity = parity;
  }

  setStructuredAppendSequenceNumber(sequenceNumber: number): void {
    this.structuredAppendSequenceNumber = sequenceNumber;
  }

  getSymbologyModifier(): number {
    return this.symbologyModifier;
  }

  setSymbologyModifier(modifier: number): void {
    this.symbologyModifier = modifier;
  }

  getVersion(): number | null {
    return this.version;
  }

  setVersion(version: number): void {
    this.version = version;
  }

  getMaskPattern(): number | null {
    return this.maskPattern;
  }

  setMaskPattern(maskPattern: number): void {
    this.maskPattern = maskPattern;
  }
}
