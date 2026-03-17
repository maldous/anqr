import type { BitMatrix } from "./bit-matrix";
import { ChecksumException, FormatException } from "./exceptions";
import { type ErrorCorrectionLevel, Mode, Version } from "./qr-version";
import { GenericGF, ReedSolomonDecoder } from "./reed-solomon";
import { DecoderResult } from "./result-types";
import { StringBuilder, StringEncoding, StringUtils } from "./util";
import { BitMatrixParser } from "./bit-matrix-parser";
import { BitSource } from "./bit-source";

/**
 * Main QR code decoder
 */
export class QRDecoder {
  private readonly rsDecoder: ReedSolomonDecoder;

  constructor() {
    this.rsDecoder = new ReedSolomonDecoder(GenericGF.QR_CODE_FIELD_256);
  }

  decode(bits: BitMatrix, hints?: Map<number, unknown>): DecoderResult {
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

  private decodeBitMatrix(parser: BitMatrixParser, hints?: Map<number, unknown>): DecoderResult {
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
    ecLevel: ErrorCorrectionLevel,
  ): { codewords: Int32Array; numDataCodewords: number }[] {
    const ecBlocks = version.getECBlocksForLevel(ecLevel);
    let totalBlocks = 0;
    const ecBlockArray = ecBlocks.getECBlocks();
    for (const ecBlock of ecBlockArray) {
      totalBlocks += ecBlock.getCount();
    }

    const result: { codewords: Int32Array; numDataCodewords: number }[] = Array.from({
      length: totalBlocks,
    });
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
    QRDecoder.interleaveCodewords(
      result,
      rawCodewords,
      numResultBlocks,
      shorterBlocksNumDataCodewords,
      longerBlocksStartAt,
    );
    return result;
  }

  private static interleaveCodewords(
    result: { codewords: Int32Array; numDataCodewords: number }[],
    rawCodewords: Uint8Array,
    numResultBlocks: number,
    shorterBlocksNumDataCodewords: number,
    longerBlocksStartAt: number,
  ): void {
    let offset = 0;
    for (let i = 0; i < shorterBlocksNumDataCodewords; i++) {
      for (let j = 0; j < numResultBlocks; j++) {
        result[j].codewords[i] = rawCodewords[offset++];
      }
    }
    for (let j = longerBlocksStartAt; j < numResultBlocks; j++) {
      result[j].codewords[shorterBlocksNumDataCodewords] = rawCodewords[offset++];
    }
    const max = result[0].codewords.length;
    for (let i = shorterBlocksNumDataCodewords; i < max; i++) {
      for (let j = 0; j < numResultBlocks; j++) {
        const jOffset = j < longerBlocksStartAt ? i : i + 1;
        result[j].codewords[jOffset] = rawCodewords[offset++];
      }
    }
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
    hints?: Map<number, unknown>,
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
          this.decodeContentSegment(bits, result, mode, count, fc1InEffect, byteSegments, hints);
        }
      }
    } while (mode !== Mode.TERMINATOR);

    return new DecoderResult(
      bytes,
      result.toString(),
      byteSegments.length === 0 ? null : byteSegments,
      ecLevel.toString(),
    );
  }

  private decodeContentSegment(
    bits: BitSource,
    result: StringBuilder,
    mode: Mode,
    count: number,
    fc1InEffect: boolean,
    byteSegments: Uint8Array[],
    hints?: Map<number, unknown>,
  ): void {
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

  private static readonly ALPHANUMERIC_CHARS =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:".split("");

  private decodeAlphanumericSegment(
    bits: BitSource,
    result: StringBuilder,
    count: number,
    fc1InEffect: boolean,
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
      QRDecoder.applyFNC1Substitution(result, start);
    }
  }

  private static applyFNC1Substitution(result: StringBuilder, start: number): void {
    for (let i = start; i < result.length(); i++) {
      if (result.charAt(i) === "%") {
        if (i < result.length() - 1 && result.charAt(i + 1) === "%") {
          result.deleteCharAt(i + 1);
        } else {
          result.setCharAt(i, String.fromCodePoint(0x1d));
        }
      }
    }
  }

  private decodeByteSegment(
    bits: BitSource,
    result: StringBuilder,
    count: number,
    byteSegments: Uint8Array[],
    hints?: Map<number, unknown>,
  ): void {
    if (8 * count > bits.available()) throw new FormatException();
    const readBytes = new Uint8Array(count);
    for (let i = 0; i < count; i++) {
      readBytes[i] = bits.readBits(8);
    }
    let encoding: string;
    if (hints?.has(4)) {
      // CHARACTER_SET hint
      encoding = hints.get(4) as string;
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
      buffer.push((assembledTwoBytes >> 8) & 0xff, assembledTwoBytes & 0xff);
    }
    result.append(StringEncoding.decode(new Uint8Array(buffer), "SJIS"));
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
      buffer.push((assembledTwoBytes >> 8) & 0xff, assembledTwoBytes & 0xff);
    }
    result.append(StringEncoding.decode(new Uint8Array(buffer), "GB2312"));
  }
}
