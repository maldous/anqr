/**
 * QR Decoder Data Decoder
 * Decodes QR code data from bit matrix
 */

import { createLogger } from '../../lib/logger';

const _log = createLogger('DECODER');

import type { BitMatrix } from './bit-matrix';
import { ChecksumException, FormatException } from './exceptions';
import {
  DataMask,
  type ErrorCorrectionLevel,
  FormatInformation,
  Mode,
  Version,
} from './qr-version';
import { GenericGF, ReedSolomonDecoder } from './reed-solomon';
import { DecoderResult } from './result-types';
import { StringBuilder, StringEncoding, StringUtils } from './util';

/**
 * Parses the QR code bit matrix into format and version info
 */
export class BitMatrixParser {
  private parsedVersion: Version | null = null;
  private parsedFormatInfo: FormatInformation | null = null;
  private mirror = false;

  constructor(private readonly bitMatrix: BitMatrix) {
    const dimension = bitMatrix.getHeight();
    if (dimension < 21 || (dimension & 0x03) !== 1) {
      throw new FormatException();
    }
  }

  readFormatInformation(): FormatInformation {
    if (this.parsedFormatInfo !== null) return this.parsedFormatInfo;

    let formatInfoBits1 = 0;
    for (let i = 0; i < 6; i++) {
      formatInfoBits1 = this.copyBit(i, 8, formatInfoBits1);
    }
    formatInfoBits1 = this.copyBit(7, 8, formatInfoBits1);
    formatInfoBits1 = this.copyBit(8, 8, formatInfoBits1);
    formatInfoBits1 = this.copyBit(8, 7, formatInfoBits1);
    for (let j = 5; j >= 0; j--) {
      formatInfoBits1 = this.copyBit(8, j, formatInfoBits1);
    }

    const dimension = this.bitMatrix.getHeight();
    let formatInfoBits2 = 0;
    const jMin = dimension - 7;
    for (let j = dimension - 1; j >= jMin; j--) {
      formatInfoBits2 = this.copyBit(8, j, formatInfoBits2);
    }
    for (let i = dimension - 8; i < dimension; i++) {
      formatInfoBits2 = this.copyBit(i, 8, formatInfoBits2);
    }

    this.parsedFormatInfo = FormatInformation.decodeFormatInformation(
      formatInfoBits1,
      formatInfoBits2
    );
    if (this.parsedFormatInfo !== null) return this.parsedFormatInfo;
    throw new FormatException();
  }

  readVersion(): Version {
    if (this.parsedVersion !== null) return this.parsedVersion;

    const dimension = this.bitMatrix.getHeight();
    const provisionalVersion = (dimension - 17) / 4;
    if (provisionalVersion <= 6) {
      return Version.getVersionForNumber(provisionalVersion);
    }

    let versionBits = 0;
    const ijMin = dimension - 11;
    for (let j = 5; j >= 0; j--) {
      for (let i = dimension - 9; i >= ijMin; i--) {
        versionBits = this.copyBit(i, j, versionBits);
      }
    }

    let theParsedVersion = Version.decodeVersionInformation(versionBits);
    if (theParsedVersion !== null && theParsedVersion.getDimensionForVersion() === dimension) {
      this.parsedVersion = theParsedVersion;
      return theParsedVersion;
    }

    versionBits = 0;
    for (let i = 5; i >= 0; i--) {
      for (let j = dimension - 9; j >= ijMin; j--) {
        versionBits = this.copyBit(i, j, versionBits);
      }
    }

    theParsedVersion = Version.decodeVersionInformation(versionBits);
    if (theParsedVersion !== null && theParsedVersion.getDimensionForVersion() === dimension) {
      this.parsedVersion = theParsedVersion;
      return theParsedVersion;
    }
    throw new FormatException();
  }

  private copyBit(i: number, j: number, versionBits: number): number {
    const bit = this.mirror ? this.bitMatrix.get(j, i) : this.bitMatrix.get(i, j);
    return bit ? (versionBits << 1) | 0x1 : versionBits << 1;
  }

  readCodewords(): Uint8Array {
    const formatInfo = this.readFormatInformation();
    const version = this.readVersion();

    DataMask.unmaskBitMatrix(this.bitMatrix, this.bitMatrix.getHeight(), formatInfo.getDataMask());

    const functionPattern = version.buildFunctionPattern();
    let readingUp = true;
    const result: number[] = [];
    let resultOffset = 0;
    let currentByte = 0;
    let bitsRead = 0;
    const dimension = this.bitMatrix.getHeight();

    let j = dimension - 1;
    while (j > 0) {
      if (j === 6) j--;
      for (let count = 0; count < dimension; count++) {
        const i = readingUp ? dimension - 1 - count : count;
        for (let col = 0; col < 2; col++) {
          if (!functionPattern.get(j - col, i)) {
            bitsRead++;
            currentByte <<= 1;
            if (this.bitMatrix.get(j - col, i)) {
              currentByte |= 1;
            }
            if (bitsRead === 8) {
              result[resultOffset++] = currentByte;
              bitsRead = 0;
              currentByte = 0;
            }
          }
        }
      }
      readingUp = !readingUp;
      j -= 2;
    }
    if (resultOffset !== version.getTotalCodewords()) {
      throw new FormatException();
    }
    return new Uint8Array(result);
  }

  remask(): void {
    if (this.parsedFormatInfo === null) return;
    DataMask.unmaskBitMatrix(
      this.bitMatrix,
      this.bitMatrix.getHeight(),
      this.parsedFormatInfo.getDataMask()
    );
  }

  setMirror(mirror: boolean): void {
    this.parsedVersion = null;
    this.parsedFormatInfo = null;
    this.mirror = mirror;
  }

  mirror_(): void {
    const dimension = this.bitMatrix.getHeight();
    for (let x = 0; x < dimension; x++) {
      for (let y = x + 1; y < dimension; y++) {
        if (this.bitMatrix.get(x, y) !== this.bitMatrix.get(y, x)) {
          this.bitMatrix.flip(y, x);
          this.bitMatrix.flip(x, y);
        }
      }
    }
  }
}

/**
 * Main QR code decoder
 */
export class QRDecoder {
  private readonly rsDecoder: ReedSolomonDecoder;

  constructor() {
    this.rsDecoder = new ReedSolomonDecoder(GenericGF.QR_CODE_FIELD_256);
  }

  decode(bits: BitMatrix, hints?: Map<number, any>): DecoderResult {
    const parser = new BitMatrixParser(bits);
    let fe: Error | null = null;
    let ce: Error | null = null;

    try {
      return this.decodeBitMatrix(parser, hints);
    } catch (e) {
      fe = e as Error;
    }

    try {
      parser.remask();
      parser.setMirror(true);
      parser.readVersion();
      parser.readFormatInformation();
      parser.mirror_();
      const result = this.decodeBitMatrix(parser, hints);
      result.setOther(result);
      return result;
    } catch (e) {
      ce = e as Error;
    }

    if (fe !== null) throw fe;
    throw ce;
  }

  private decodeBitMatrix(parser: BitMatrixParser, hints?: Map<number, any>): DecoderResult {
    const version = parser.readVersion();
    const formatInfo = parser.readFormatInformation();
    const ecLevel = formatInfo.getErrorCorrectionLevel();
    const maskPattern = formatInfo.getDataMask();
    const codewords = parser.readCodewords();
    const dataBlocks = this.getDataBlocks(codewords, version, ecLevel);

    let totalBytes = 0;
    for (const dataBlock of dataBlocks) {
      totalBytes += dataBlock.numDataCodewords;
    }
    const resultBytes = new Uint8Array(totalBytes);
    let resultOffset = 0;

    for (const dataBlock of dataBlocks) {
      const codewordBytes = dataBlock.codewords;
      const numDataCodewords = dataBlock.numDataCodewords;
      this.correctErrors(codewordBytes, numDataCodewords);
      for (let i = 0; i < numDataCodewords; i++) {
        resultBytes[resultOffset++] = codewordBytes[i];
      }
    }

    const result = this.decodeData(resultBytes, version, ecLevel, hints);
    result.setVersion(version.getVersionNumber());
    result.setMaskPattern(maskPattern);
    return result;
  }

  private getDataBlocks(
    rawCodewords: Uint8Array,
    version: Version,
    ecLevel: ErrorCorrectionLevel
  ): { codewords: Int32Array; numDataCodewords: number }[] {
    const ecBlocks = version.getECBlocksForLevel(ecLevel);
    let totalBlocks = 0;
    const ecBlockArray = ecBlocks.getECBlocks();
    for (const ecBlock of ecBlockArray) {
      totalBlocks += ecBlock.getCount();
    }

    const result: { codewords: Int32Array; numDataCodewords: number }[] = new Array(totalBlocks);
    let numResultBlocks = 0;
    for (const ecBlock of ecBlockArray) {
      for (let i = 0; i < ecBlock.getCount(); i++) {
        const numDataCodewords = ecBlock.getDataCodewords();
        const numBlockCodewords = ecBlocks.getECCodewordsPerBlock() + numDataCodewords;
        result[numResultBlocks++] = {
          codewords: new Int32Array(numBlockCodewords),
          numDataCodewords,
        };
      }
    }

    const shorterBlocksTotalCodewords = result[0].codewords.length;
    let longerBlocksStartAt = result.length - 1;
    while (longerBlocksStartAt >= 0) {
      const numCodewords = result[longerBlocksStartAt].codewords.length;
      if (numCodewords === shorterBlocksTotalCodewords) break;
      longerBlocksStartAt--;
    }
    longerBlocksStartAt++;

    const shorterBlocksNumDataCodewords =
      shorterBlocksTotalCodewords - ecBlocks.getECCodewordsPerBlock();
    let rawCodewordsOffset = 0;
    for (let i = 0; i < shorterBlocksNumDataCodewords; i++) {
      for (let j = 0; j < numResultBlocks; j++) {
        result[j].codewords[i] = rawCodewords[rawCodewordsOffset++];
      }
    }
    for (let j = longerBlocksStartAt; j < numResultBlocks; j++) {
      result[j].codewords[shorterBlocksNumDataCodewords] = rawCodewords[rawCodewordsOffset++];
    }
    const max = result[0].codewords.length;
    for (let i = shorterBlocksNumDataCodewords; i < max; i++) {
      for (let j = 0; j < numResultBlocks; j++) {
        const jOffset = j < longerBlocksStartAt ? i : i + 1;
        result[j].codewords[jOffset] = rawCodewords[rawCodewordsOffset++];
      }
    }
    return result;
  }

  private correctErrors(codewordBytes: Int32Array, numDataCodewords: number): void {
    const numCodewords = codewordBytes.length;
    const codewordsInts = new Int32Array(numCodewords);
    for (let i = 0; i < numCodewords; i++) {
      codewordsInts[i] = codewordBytes[i] & 0xff;
    }
    try {
      this.rsDecoder.decode(codewordsInts, codewordBytes.length - numDataCodewords);
    } catch {
      throw new ChecksumException();
    }
    for (let i = 0; i < numDataCodewords; i++) {
      codewordBytes[i] = codewordsInts[i];
    }
  }

  private decodeData(
    bytes: Uint8Array,
    version: Version,
    ecLevel: ErrorCorrectionLevel,
    hints?: Map<number, any>
  ): DecoderResult {
    const bits = new BitSource(bytes);
    const result = new StringBuilder();
    const byteSegments: Uint8Array[] = [];
    let mode: Mode;
    let fc1InEffect = false;

    do {
      if (bits.available() < 4) {
        mode = Mode.TERMINATOR;
      } else {
        const modeBits = bits.readBits(4);
        mode = Mode.forBits(modeBits);
      }
      switch (mode) {
        case Mode.TERMINATOR:
          break;
        case Mode.FNC1_FIRST_POSITION:
        case Mode.FNC1_SECOND_POSITION:
          fc1InEffect = true;
          break;
        case Mode.STRUCTURED_APPEND:
          if (bits.available() < 16) throw new FormatException();
          bits.readBits(16);
          break;
        case Mode.ECI: {
          const _value = this.parseECIValue(bits);
          break;
        }
        case Mode.HANZI: {
          const subset = bits.readBits(4);
          const countHanzi = bits.readBits(mode.getCharacterCountBits(version));
          if (subset === 1) {
            this.decodeHanziSegment(bits, result, countHanzi);
          }
          break;
        }
        default: {
          const count = bits.readBits(mode.getCharacterCountBits(version));
          switch (mode) {
            case Mode.NUMERIC:
              this.decodeNumericSegment(bits, result, count);
              break;
            case Mode.ALPHANUMERIC:
              this.decodeAlphanumericSegment(bits, result, count, fc1InEffect);
              break;
            case Mode.BYTE:
              this.decodeByteSegment(bits, result, count, byteSegments, hints);
              break;
            case Mode.KANJI:
              this.decodeKanjiSegment(bits, result, count);
              break;
            default:
              throw new FormatException();
          }
        }
      }
    } while (mode !== Mode.TERMINATOR);

    return new DecoderResult(
      bytes,
      result.toString(),
      byteSegments.length === 0 ? null : byteSegments,
      ecLevel.toString()
    );
  }

  private parseECIValue(bits: BitSource): number {
    const firstByte = bits.readBits(8);
    if ((firstByte & 0x80) === 0) return firstByte & 0x7f;
    if ((firstByte & 0xc0) === 0x80) {
      const secondByte = bits.readBits(8);
      return ((firstByte & 0x3f) << 8) | secondByte;
    }
    if ((firstByte & 0xe0) === 0xc0) {
      const secondThirdBytes = bits.readBits(16);
      return ((firstByte & 0x1f) << 16) | secondThirdBytes;
    }
    throw new FormatException();
  }

  private decodeNumericSegment(bits: BitSource, result: StringBuilder, count: number): void {
    while (count >= 3) {
      if (bits.available() < 10) throw new FormatException();
      const threeDigitsBits = bits.readBits(10);
      if (threeDigitsBits >= 1000) throw new FormatException();
      result.append(String.fromCodePoint(48 + Math.floor(threeDigitsBits / 100)));
      result.append(String.fromCodePoint(48 + Math.floor((threeDigitsBits / 10) % 10)));
      result.append(String.fromCodePoint(48 + (threeDigitsBits % 10)));
      count -= 3;
    }
    if (count === 2) {
      if (bits.available() < 7) throw new FormatException();
      const twoDigitsBits = bits.readBits(7);
      if (twoDigitsBits >= 100) throw new FormatException();
      result.append(String.fromCodePoint(48 + Math.floor(twoDigitsBits / 10)));
      result.append(String.fromCodePoint(48 + (twoDigitsBits % 10)));
    } else if (count === 1) {
      if (bits.available() < 4) throw new FormatException();
      const digitBits = bits.readBits(4);
      if (digitBits >= 10) throw new FormatException();
      result.append(String.fromCodePoint(48 + digitBits));
    }
  }

  private static ALPHANUMERIC_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:'.split('');

  private decodeAlphanumericSegment(
    bits: BitSource,
    result: StringBuilder,
    count: number,
    fc1InEffect: boolean
  ): void {
    const start = result.length();
    while (count > 1) {
      if (bits.available() < 11) throw new FormatException();
      const nextTwoCharsBits = bits.readBits(11);
      result.append(QRDecoder.ALPHANUMERIC_CHARS[Math.floor(nextTwoCharsBits / 45)]);
      result.append(QRDecoder.ALPHANUMERIC_CHARS[nextTwoCharsBits % 45]);
      count -= 2;
    }
    if (count === 1) {
      if (bits.available() < 6) throw new FormatException();
      result.append(QRDecoder.ALPHANUMERIC_CHARS[bits.readBits(6)]);
    }
    if (fc1InEffect) {
      for (let i = start; i < result.length(); i++) {
        if (result.charAt(i) === '%') {
          if (i < result.length() - 1 && result.charAt(i + 1) === '%') {
            result.deleteCharAt(i + 1);
          } else {
            result.setCharAt(i, String.fromCodePoint(0x1d));
          }
        }
      }
    }
  }

  private decodeByteSegment(
    bits: BitSource,
    result: StringBuilder,
    count: number,
    byteSegments: Uint8Array[],
    hints?: Map<number, any>
  ): void {
    if (8 * count > bits.available()) throw new FormatException();
    const readBytes = new Uint8Array(count);
    for (let i = 0; i < count; i++) {
      readBytes[i] = bits.readBits(8);
    }
    let encoding: string;
    if (hints?.has(4)) {
      // CHARACTER_SET hint
      encoding = hints.get(4);
    } else {
      encoding = StringUtils.guessEncoding(readBytes, hints);
    }
    result.append(StringEncoding.decode(readBytes, encoding));
    byteSegments.push(readBytes);
  }

  private decodeKanjiSegment(bits: BitSource, result: StringBuilder, count: number): void {
    if (13 * count > bits.available()) throw new FormatException();
    const buffer: number[] = [];
    for (let i = 0; i < count; i++) {
      const twoBytes = bits.readBits(13);
      let assembledTwoBytes = (Math.trunc(twoBytes / 0xc0) << 8) | (twoBytes % 0xc0);
      if (assembledTwoBytes < 0x1f00) {
        assembledTwoBytes += 0x8140;
      } else {
        assembledTwoBytes += 0xc140;
      }
      buffer.push((assembledTwoBytes >> 8) & 0xff);
      buffer.push(assembledTwoBytes & 0xff);
    }
    result.append(StringEncoding.decode(new Uint8Array(buffer), 'SJIS'));
  }

  private decodeHanziSegment(bits: BitSource, result: StringBuilder, count: number): void {
    if (13 * count > bits.available()) throw new FormatException();
    const buffer: number[] = [];
    for (let i = 0; i < count; i++) {
      const twoBytes = bits.readBits(13);
      let assembledTwoBytes = (Math.trunc(twoBytes / 0x060) << 8) | (twoBytes % 0x060);
      if (assembledTwoBytes < 0x00a00) {
        assembledTwoBytes += 0x0a1a1;
      } else {
        assembledTwoBytes += 0x0a6a1;
      }
      buffer.push((assembledTwoBytes >> 8) & 0xff);
      buffer.push(assembledTwoBytes & 0xff);
    }
    result.append(StringEncoding.decode(new Uint8Array(buffer), 'GB2312'));
  }
}

/**
 * Bit source for reading bits from byte array
 *
 * Enhanced with diagnostic logging for QR-Art debugging.
 * When a read overruns available bits, we log detailed context
 * to help identify whether terminator/padding was corrupted.
 */
class BitSource {
  private byteOffset = 0;
  private bitOffset = 0;
  private totalBitsRead = 0;

  constructor(private readonly bytes: Uint8Array) {}

  available(): number {
    return 8 * (this.bytes.length - this.byteOffset) - this.bitOffset;
  }

  /**
   * Get current position for diagnostic logging
   */
  getPosition(): {
    byteOffset: number;
    bitOffset: number;
    totalBitsRead: number;
    available: number;
  } {
    return {
      byteOffset: this.byteOffset,
      bitOffset: this.bitOffset,
      totalBitsRead: this.totalBitsRead,
      available: this.available(),
    };
  }

  readBits(numBits: number): number {
    if (numBits < 1 || numBits > 32 || numBits > this.available()) {
      // Enhanced error with diagnostic context
      const pos = this.getPosition();
      const context = {
        requestedBits: numBits,
        availableBits: pos.available,
        byteOffset: pos.byteOffset,
        bitOffset: pos.bitOffset,
        totalBitsRead: pos.totalBitsRead,
        totalBytes: this.bytes.length,
        // Show remaining bytes as hex for debugging
        remainingBytesHex: Array.from(
          this.bytes.slice(pos.byteOffset, Math.min(pos.byteOffset + 8, this.bytes.length))
        )
          .map((b) => b.toString(16).padStart(2, '0'))
          .join(' '),
      };
      throw new FormatException(
        `BitSource overrun: requested ${numBits} bits but only ${pos.available} available. ` +
          `Position: byte ${pos.byteOffset}, bit ${pos.bitOffset}. ` +
          `This often indicates corrupted terminator/padding in QR-Art. ` +
          `Context: ${JSON.stringify(context)}`
      );
    }

    const originalNumBits = numBits;
    let result = 0;
    if (this.bitOffset > 0) {
      const bitsLeft = 8 - this.bitOffset;
      const toRead = Math.min(numBits, bitsLeft);
      const bitsToNotRead = bitsLeft - toRead;
      const mask = (0xff >> (8 - toRead)) << bitsToNotRead;
      result = (this.bytes[this.byteOffset] & mask) >> bitsToNotRead;
      numBits -= toRead;
      this.bitOffset += toRead;
      if (this.bitOffset === 8) {
        this.bitOffset = 0;
        this.byteOffset++;
      }
    }

    if (numBits > 0) {
      while (numBits >= 8) {
        result = (result << 8) | (this.bytes[this.byteOffset] & 0xff);
        this.byteOffset++;
        numBits -= 8;
      }

      if (numBits > 0) {
        const bitsToNotRead = 8 - numBits;
        const mask = (0xff >> bitsToNotRead) << bitsToNotRead;
        result = (result << numBits) | ((this.bytes[this.byteOffset] & mask) >> bitsToNotRead);
        this.bitOffset += numBits;
      }
    }
    this.totalBitsRead += originalNumBits;
    return result;
  }
}
