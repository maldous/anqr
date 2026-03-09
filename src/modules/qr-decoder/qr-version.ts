/**
 * QR Decoder Version
 * QR Code version, mode, and error correction level definitions
 */

import { createLogger } from '../../lib/logger';

const _log = createLogger('DECODER');

import { BitMatrix } from './bit-matrix';
import { FormatException, IllegalArgumentException } from './exceptions';

/**
 * Error correction level values
 */
export enum ErrorCorrectionLevelValue {
  L = 0,
  M = 1,
  Q = 2,
  H = 3,
}

/**
 * Error correction level (L, M, Q, H)
 */
export class ErrorCorrectionLevel {
  private static FOR_BITS = new Map<number, ErrorCorrectionLevel>();

  static readonly L = new ErrorCorrectionLevel(ErrorCorrectionLevelValue.L, 'L', 0x01);
  static readonly M = new ErrorCorrectionLevel(ErrorCorrectionLevelValue.M, 'M', 0x00);
  static readonly Q = new ErrorCorrectionLevel(ErrorCorrectionLevelValue.Q, 'Q', 0x03);
  static readonly H = new ErrorCorrectionLevel(ErrorCorrectionLevelValue.H, 'H', 0x02);

  private constructor(
    private value: ErrorCorrectionLevelValue,
    private stringValue: string,
    private bits: number
  ) {
    ErrorCorrectionLevel.FOR_BITS.set(bits, this);
  }

  getValue(): ErrorCorrectionLevelValue {
    return this.value;
  }

  getBits(): number {
    return this.bits;
  }

  toString(): string {
    return this.stringValue;
  }

  equals(o: any): boolean {
    if (!(o instanceof ErrorCorrectionLevel)) return false;
    return this.value === o.value;
  }

  static forBits(bits: number): ErrorCorrectionLevel {
    if (bits < 0 || bits >= ErrorCorrectionLevel.FOR_BITS.size) {
      throw new IllegalArgumentException();
    }
    return ErrorCorrectionLevel.FOR_BITS.get(bits)!;
  }

  static fromString(s: string): ErrorCorrectionLevel {
    switch (s) {
      case 'L':
        return ErrorCorrectionLevel.L;
      case 'M':
        return ErrorCorrectionLevel.M;
      case 'Q':
        return ErrorCorrectionLevel.Q;
      case 'H':
        return ErrorCorrectionLevel.H;
      default:
        throw new IllegalArgumentException(`${s} not available`);
    }
  }
}

/**
 * QR Code encoding mode values
 */
export enum ModeValue {
  TERMINATOR = 0,
  NUMERIC = 1,
  ALPHANUMERIC = 2,
  STRUCTURED_APPEND = 3,
  BYTE = 4,
  ECI = 5,
  KANJI = 6,
  FNC1_FIRST_POSITION = 7,
  FNC1_SECOND_POSITION = 8,
  HANZI = 9,
}

/**
 * QR Code encoding mode
 */
export class Mode {
  private static FOR_BITS = new Map<number, Mode>();

  static readonly TERMINATOR = new Mode(
    ModeValue.TERMINATOR,
    'TERMINATOR',
    Int32Array.from([0, 0, 0]),
    0x00
  );
  static readonly NUMERIC = new Mode(
    ModeValue.NUMERIC,
    'NUMERIC',
    Int32Array.from([10, 12, 14]),
    0x01
  );
  static readonly ALPHANUMERIC = new Mode(
    ModeValue.ALPHANUMERIC,
    'ALPHANUMERIC',
    Int32Array.from([9, 11, 13]),
    0x02
  );
  static readonly STRUCTURED_APPEND = new Mode(
    ModeValue.STRUCTURED_APPEND,
    'STRUCTURED_APPEND',
    Int32Array.from([0, 0, 0]),
    0x03
  );
  static readonly BYTE = new Mode(ModeValue.BYTE, 'BYTE', Int32Array.from([8, 16, 16]), 0x04);
  static readonly ECI = new Mode(ModeValue.ECI, 'ECI', Int32Array.from([0, 0, 0]), 0x07);
  static readonly KANJI = new Mode(ModeValue.KANJI, 'KANJI', Int32Array.from([8, 10, 12]), 0x08);
  static readonly FNC1_FIRST_POSITION = new Mode(
    ModeValue.FNC1_FIRST_POSITION,
    'FNC1_FIRST_POSITION',
    Int32Array.from([0, 0, 0]),
    0x05
  );
  static readonly FNC1_SECOND_POSITION = new Mode(
    ModeValue.FNC1_SECOND_POSITION,
    'FNC1_SECOND_POSITION',
    Int32Array.from([0, 0, 0]),
    0x09
  );
  static readonly HANZI = new Mode(ModeValue.HANZI, 'HANZI', Int32Array.from([8, 10, 12]), 0x0d);

  private constructor(
    private value: ModeValue,
    private stringValue: string,
    private characterCountBitsForVersions: Int32Array,
    private bits: number
  ) {
    Mode.FOR_BITS.set(bits, this);
  }

  static forBits(bits: number): Mode {
    const mode = Mode.FOR_BITS.get(bits);
    if (mode === undefined) throw new IllegalArgumentException();
    return mode;
  }

  getCharacterCountBits(version: Version): number {
    const versionNumber = version.getVersionNumber();
    let offset: number;
    if (versionNumber <= 9) offset = 0;
    else if (versionNumber <= 26) offset = 1;
    else offset = 2;
    return this.characterCountBitsForVersions[offset];
  }

  getValue(): ModeValue {
    return this.value;
  }

  getBits(): number {
    return this.bits;
  }

  equals(o: any): boolean {
    if (!(o instanceof Mode)) return false;
    return this.value === o.value;
  }

  toString(): string {
    return this.stringValue;
  }
}

/**
 * Error correction block
 */
export class ECB {
  constructor(
    private count: number,
    private dataCodewords: number
  ) {}

  getCount(): number {
    return this.count;
  }

  getDataCodewords(): number {
    return this.dataCodewords;
  }
}

/**
 * Error correction blocks for a version/level
 */
export class ECBlocks {
  private ecBlocks: ECB[];

  constructor(
    private ecCodewordsPerBlock: number,
    ...ecBlocks: ECB[]
  ) {
    this.ecBlocks = ecBlocks;
  }

  getECCodewordsPerBlock(): number {
    return this.ecCodewordsPerBlock;
  }

  getNumBlocks(): number {
    let total = 0;
    for (const ecBlock of this.ecBlocks) {
      total += ecBlock.getCount();
    }
    return total;
  }

  getTotalECCodewords(): number {
    return this.ecCodewordsPerBlock * this.getNumBlocks();
  }

  getECBlocks(): ECB[] {
    return this.ecBlocks;
  }
}

/**
 * QR Code version information
 */
export class Version {
  private static VERSION_DECODE_INFO = Int32Array.from([
    0x07c94, 0x085bc, 0x09a99, 0x0a4d3, 0x0bbf6, 0x0c762, 0x0d847, 0x0e60d, 0x0f928, 0x10b78,
    0x1145d, 0x12a17, 0x13532, 0x149a6, 0x15683, 0x168c9, 0x177ec, 0x18ec4, 0x191e1, 0x1afab,
    0x1b08e, 0x1cc1a, 0x1d33f, 0x1ed75, 0x1f250, 0x209d5, 0x216f0, 0x228ba, 0x2379f, 0x24b0b,
    0x2542e, 0x26a64, 0x27541, 0x28c69,
  ]);

  private static VERSIONS: Version[] = Version.buildVersions();
  private ecBlocks: ECBlocks[];
  private totalCodewords: number;

  private constructor(
    private versionNumber: number,
    private alignmentPatternCenters: Int32Array,
    ...ecBlocks: ECBlocks[]
  ) {
    this.ecBlocks = ecBlocks;
    let total = 0;
    const ecCodewords = ecBlocks[0].getECCodewordsPerBlock();
    const ecbArray = ecBlocks[0].getECBlocks();
    for (const ecBlock of ecbArray) {
      total += ecBlock.getCount() * (ecBlock.getDataCodewords() + ecCodewords);
    }
    this.totalCodewords = total;
  }

  getVersionNumber(): number {
    return this.versionNumber;
  }

  getAlignmentPatternCenters(): Int32Array {
    return this.alignmentPatternCenters;
  }

  getTotalCodewords(): number {
    return this.totalCodewords;
  }

  getDimensionForVersion(): number {
    return 17 + 4 * this.versionNumber;
  }

  getECBlocksForLevel(ecLevel: ErrorCorrectionLevel): ECBlocks {
    return this.ecBlocks[ecLevel.getValue()];
  }

  static getProvisionalVersionForDimension(dimension: number): Version {
    if (dimension % 4 !== 1) throw new FormatException();
    try {
      return Version.getVersionForNumber((dimension - 17) / 4);
    } catch (_ignored) {
      throw new FormatException();
    }
  }

  static getVersionForNumber(versionNumber: number): Version {
    if (versionNumber < 1 || versionNumber > 40) throw new IllegalArgumentException();
    return Version.VERSIONS[versionNumber - 1];
  }

  static decodeVersionInformation(versionBits: number): Version | null {
    let bestDifference = Number.MAX_SAFE_INTEGER;
    let bestVersion = 0;
    for (let i = 0; i < Version.VERSION_DECODE_INFO.length; i++) {
      const targetVersion = Version.VERSION_DECODE_INFO[i];
      if (targetVersion === versionBits) return Version.getVersionForNumber(i + 7);
      const bitsDifference = FormatInformation.numBitsDiffering(versionBits, targetVersion);
      if (bitsDifference < bestDifference) {
        bestVersion = i + 7;
        bestDifference = bitsDifference;
      }
    }
    if (bestDifference <= 3) return Version.getVersionForNumber(bestVersion);
    return null;
  }

  buildFunctionPattern(): BitMatrix {
    const dimension = this.getDimensionForVersion();
    const bitMatrix = new BitMatrix(dimension);
    bitMatrix.setRegion(0, 0, 9, 9);
    bitMatrix.setRegion(dimension - 8, 0, 8, 9);
    bitMatrix.setRegion(0, dimension - 8, 9, 8);
    const max = this.alignmentPatternCenters.length;
    for (let x = 0; x < max; x++) {
      const i = this.alignmentPatternCenters[x] - 2;
      for (let y = 0; y < max; y++) {
        if ((x === 0 && (y === 0 || y === max - 1)) || (x === max - 1 && y === 0)) continue;
        bitMatrix.setRegion(this.alignmentPatternCenters[y] - 2, i, 5, 5);
      }
    }
    bitMatrix.setRegion(6, 9, 1, dimension - 17);
    bitMatrix.setRegion(9, 6, dimension - 17, 1);
    if (this.versionNumber > 6) {
      bitMatrix.setRegion(dimension - 11, 0, 3, 6);
      bitMatrix.setRegion(0, dimension - 11, 6, 3);
    }
    return bitMatrix;
  }

  toString(): string {
    return `${this.versionNumber}`;
  }

  private static buildVersions(): Version[] {
    return [
      new Version(
        1,
        new Int32Array(0),
        new ECBlocks(7, new ECB(1, 19)),
        new ECBlocks(10, new ECB(1, 16)),
        new ECBlocks(13, new ECB(1, 13)),
        new ECBlocks(17, new ECB(1, 9))
      ),
      new Version(
        2,
        Int32Array.from([6, 18]),
        new ECBlocks(10, new ECB(1, 34)),
        new ECBlocks(16, new ECB(1, 28)),
        new ECBlocks(22, new ECB(1, 22)),
        new ECBlocks(28, new ECB(1, 16))
      ),
      new Version(
        3,
        Int32Array.from([6, 22]),
        new ECBlocks(15, new ECB(1, 55)),
        new ECBlocks(26, new ECB(1, 44)),
        new ECBlocks(18, new ECB(2, 17)),
        new ECBlocks(22, new ECB(2, 13))
      ),
      new Version(
        4,
        Int32Array.from([6, 26]),
        new ECBlocks(20, new ECB(1, 80)),
        new ECBlocks(18, new ECB(2, 32)),
        new ECBlocks(26, new ECB(2, 24)),
        new ECBlocks(16, new ECB(4, 9))
      ),
      new Version(
        5,
        Int32Array.from([6, 30]),
        new ECBlocks(26, new ECB(1, 108)),
        new ECBlocks(24, new ECB(2, 43)),
        new ECBlocks(18, new ECB(2, 15), new ECB(2, 16)),
        new ECBlocks(22, new ECB(2, 11), new ECB(2, 12))
      ),
      new Version(
        6,
        Int32Array.from([6, 34]),
        new ECBlocks(18, new ECB(2, 68)),
        new ECBlocks(16, new ECB(4, 27)),
        new ECBlocks(24, new ECB(4, 19)),
        new ECBlocks(28, new ECB(4, 15))
      ),
      new Version(
        7,
        Int32Array.from([6, 22, 38]),
        new ECBlocks(20, new ECB(2, 78)),
        new ECBlocks(18, new ECB(4, 31)),
        new ECBlocks(18, new ECB(2, 14), new ECB(4, 15)),
        new ECBlocks(26, new ECB(4, 13), new ECB(1, 14))
      ),
      new Version(
        8,
        Int32Array.from([6, 24, 42]),
        new ECBlocks(24, new ECB(2, 97)),
        new ECBlocks(22, new ECB(2, 38), new ECB(2, 39)),
        new ECBlocks(22, new ECB(4, 18), new ECB(2, 19)),
        new ECBlocks(26, new ECB(4, 14), new ECB(2, 15))
      ),
      new Version(
        9,
        Int32Array.from([6, 26, 46]),
        new ECBlocks(30, new ECB(2, 116)),
        new ECBlocks(22, new ECB(3, 36), new ECB(2, 37)),
        new ECBlocks(20, new ECB(4, 16), new ECB(4, 17)),
        new ECBlocks(24, new ECB(4, 12), new ECB(4, 13))
      ),
      new Version(
        10,
        Int32Array.from([6, 28, 50]),
        new ECBlocks(18, new ECB(2, 68), new ECB(2, 69)),
        new ECBlocks(26, new ECB(4, 43), new ECB(1, 44)),
        new ECBlocks(24, new ECB(6, 19), new ECB(2, 20)),
        new ECBlocks(28, new ECB(6, 15), new ECB(2, 16))
      ),
      // Versions 11-40 abbreviated for brevity - same pattern
      new Version(
        11,
        Int32Array.from([6, 30, 54]),
        new ECBlocks(20, new ECB(4, 81)),
        new ECBlocks(30, new ECB(1, 50), new ECB(4, 51)),
        new ECBlocks(28, new ECB(4, 22), new ECB(4, 23)),
        new ECBlocks(24, new ECB(3, 12), new ECB(8, 13))
      ),
      new Version(
        12,
        Int32Array.from([6, 32, 58]),
        new ECBlocks(24, new ECB(2, 92), new ECB(2, 93)),
        new ECBlocks(22, new ECB(6, 36), new ECB(2, 37)),
        new ECBlocks(26, new ECB(4, 20), new ECB(6, 21)),
        new ECBlocks(28, new ECB(7, 14), new ECB(4, 15))
      ),
      new Version(
        13,
        Int32Array.from([6, 34, 62]),
        new ECBlocks(26, new ECB(4, 107)),
        new ECBlocks(22, new ECB(8, 37), new ECB(1, 38)),
        new ECBlocks(24, new ECB(8, 20), new ECB(4, 21)),
        new ECBlocks(22, new ECB(12, 11), new ECB(4, 12))
      ),
      new Version(
        14,
        Int32Array.from([6, 26, 46, 66]),
        new ECBlocks(30, new ECB(3, 115), new ECB(1, 116)),
        new ECBlocks(24, new ECB(4, 40), new ECB(5, 41)),
        new ECBlocks(20, new ECB(11, 16), new ECB(5, 17)),
        new ECBlocks(24, new ECB(11, 12), new ECB(5, 13))
      ),
      new Version(
        15,
        Int32Array.from([6, 26, 48, 70]),
        new ECBlocks(22, new ECB(5, 87), new ECB(1, 88)),
        new ECBlocks(24, new ECB(5, 41), new ECB(5, 42)),
        new ECBlocks(30, new ECB(5, 24), new ECB(7, 25)),
        new ECBlocks(24, new ECB(11, 12), new ECB(7, 13))
      ),
      new Version(
        16,
        Int32Array.from([6, 26, 50, 74]),
        new ECBlocks(24, new ECB(5, 98), new ECB(1, 99)),
        new ECBlocks(28, new ECB(7, 45), new ECB(3, 46)),
        new ECBlocks(24, new ECB(15, 19), new ECB(2, 20)),
        new ECBlocks(30, new ECB(3, 15), new ECB(13, 16))
      ),
      new Version(
        17,
        Int32Array.from([6, 30, 54, 78]),
        new ECBlocks(28, new ECB(1, 107), new ECB(5, 108)),
        new ECBlocks(28, new ECB(10, 46), new ECB(1, 47)),
        new ECBlocks(28, new ECB(1, 22), new ECB(15, 23)),
        new ECBlocks(28, new ECB(2, 14), new ECB(17, 15))
      ),
      new Version(
        18,
        Int32Array.from([6, 30, 56, 82]),
        new ECBlocks(30, new ECB(5, 120), new ECB(1, 121)),
        new ECBlocks(26, new ECB(9, 43), new ECB(4, 44)),
        new ECBlocks(28, new ECB(17, 22), new ECB(1, 23)),
        new ECBlocks(28, new ECB(2, 14), new ECB(19, 15))
      ),
      new Version(
        19,
        Int32Array.from([6, 30, 58, 86]),
        new ECBlocks(28, new ECB(3, 113), new ECB(4, 114)),
        new ECBlocks(26, new ECB(3, 44), new ECB(11, 45)),
        new ECBlocks(26, new ECB(17, 21), new ECB(4, 22)),
        new ECBlocks(26, new ECB(9, 13), new ECB(16, 14))
      ),
      new Version(
        20,
        Int32Array.from([6, 34, 62, 90]),
        new ECBlocks(28, new ECB(3, 107), new ECB(5, 108)),
        new ECBlocks(26, new ECB(3, 41), new ECB(13, 42)),
        new ECBlocks(30, new ECB(15, 24), new ECB(5, 25)),
        new ECBlocks(28, new ECB(15, 15), new ECB(10, 16))
      ),
      new Version(
        21,
        Int32Array.from([6, 28, 50, 72, 94]),
        new ECBlocks(28, new ECB(4, 116), new ECB(4, 117)),
        new ECBlocks(26, new ECB(17, 42)),
        new ECBlocks(28, new ECB(17, 22), new ECB(6, 23)),
        new ECBlocks(30, new ECB(19, 16), new ECB(6, 17))
      ),
      new Version(
        22,
        Int32Array.from([6, 26, 50, 74, 98]),
        new ECBlocks(28, new ECB(2, 111), new ECB(7, 112)),
        new ECBlocks(28, new ECB(17, 46)),
        new ECBlocks(30, new ECB(7, 24), new ECB(16, 25)),
        new ECBlocks(24, new ECB(34, 13))
      ),
      new Version(
        23,
        Int32Array.from([6, 30, 54, 78, 102]),
        new ECBlocks(30, new ECB(4, 121), new ECB(5, 122)),
        new ECBlocks(28, new ECB(4, 47), new ECB(14, 48)),
        new ECBlocks(30, new ECB(11, 24), new ECB(14, 25)),
        new ECBlocks(30, new ECB(16, 15), new ECB(14, 16))
      ),
      new Version(
        24,
        Int32Array.from([6, 28, 54, 80, 106]),
        new ECBlocks(30, new ECB(6, 117), new ECB(4, 118)),
        new ECBlocks(28, new ECB(6, 45), new ECB(14, 46)),
        new ECBlocks(30, new ECB(11, 24), new ECB(16, 25)),
        new ECBlocks(30, new ECB(30, 16), new ECB(2, 17))
      ),
      new Version(
        25,
        Int32Array.from([6, 32, 58, 84, 110]),
        new ECBlocks(26, new ECB(8, 106), new ECB(4, 107)),
        new ECBlocks(28, new ECB(8, 47), new ECB(13, 48)),
        new ECBlocks(30, new ECB(7, 24), new ECB(22, 25)),
        new ECBlocks(30, new ECB(22, 15), new ECB(13, 16))
      ),
      new Version(
        26,
        Int32Array.from([6, 30, 58, 86, 114]),
        new ECBlocks(28, new ECB(10, 114), new ECB(2, 115)),
        new ECBlocks(28, new ECB(19, 46), new ECB(4, 47)),
        new ECBlocks(28, new ECB(28, 22), new ECB(6, 23)),
        new ECBlocks(30, new ECB(33, 16), new ECB(4, 17))
      ),
      new Version(
        27,
        Int32Array.from([6, 34, 62, 90, 118]),
        new ECBlocks(30, new ECB(8, 122), new ECB(4, 123)),
        new ECBlocks(28, new ECB(22, 45), new ECB(3, 46)),
        new ECBlocks(30, new ECB(8, 23), new ECB(26, 24)),
        new ECBlocks(30, new ECB(12, 15), new ECB(28, 16))
      ),
      new Version(
        28,
        Int32Array.from([6, 26, 50, 74, 98, 122]),
        new ECBlocks(30, new ECB(3, 117), new ECB(10, 118)),
        new ECBlocks(28, new ECB(3, 45), new ECB(23, 46)),
        new ECBlocks(30, new ECB(4, 24), new ECB(31, 25)),
        new ECBlocks(30, new ECB(11, 15), new ECB(31, 16))
      ),
      new Version(
        29,
        Int32Array.from([6, 30, 54, 78, 102, 126]),
        new ECBlocks(30, new ECB(7, 116), new ECB(7, 117)),
        new ECBlocks(28, new ECB(21, 45), new ECB(7, 46)),
        new ECBlocks(30, new ECB(1, 23), new ECB(37, 24)),
        new ECBlocks(30, new ECB(19, 15), new ECB(26, 16))
      ),
      new Version(
        30,
        Int32Array.from([6, 26, 52, 78, 104, 130]),
        new ECBlocks(30, new ECB(5, 115), new ECB(10, 116)),
        new ECBlocks(28, new ECB(19, 47), new ECB(10, 48)),
        new ECBlocks(30, new ECB(15, 24), new ECB(25, 25)),
        new ECBlocks(30, new ECB(23, 15), new ECB(25, 16))
      ),
      new Version(
        31,
        Int32Array.from([6, 30, 56, 82, 108, 134]),
        new ECBlocks(30, new ECB(13, 115), new ECB(3, 116)),
        new ECBlocks(28, new ECB(2, 46), new ECB(29, 47)),
        new ECBlocks(30, new ECB(42, 24), new ECB(1, 25)),
        new ECBlocks(30, new ECB(23, 15), new ECB(28, 16))
      ),
      new Version(
        32,
        Int32Array.from([6, 34, 60, 86, 112, 138]),
        new ECBlocks(30, new ECB(17, 115)),
        new ECBlocks(28, new ECB(10, 46), new ECB(23, 47)),
        new ECBlocks(30, new ECB(10, 24), new ECB(35, 25)),
        new ECBlocks(30, new ECB(19, 15), new ECB(35, 16))
      ),
      new Version(
        33,
        Int32Array.from([6, 30, 58, 86, 114, 142]),
        new ECBlocks(30, new ECB(17, 115), new ECB(1, 116)),
        new ECBlocks(28, new ECB(14, 46), new ECB(21, 47)),
        new ECBlocks(30, new ECB(29, 24), new ECB(19, 25)),
        new ECBlocks(30, new ECB(11, 15), new ECB(46, 16))
      ),
      new Version(
        34,
        Int32Array.from([6, 34, 62, 90, 118, 146]),
        new ECBlocks(30, new ECB(13, 115), new ECB(6, 116)),
        new ECBlocks(28, new ECB(14, 46), new ECB(23, 47)),
        new ECBlocks(30, new ECB(44, 24), new ECB(7, 25)),
        new ECBlocks(30, new ECB(59, 16), new ECB(1, 17))
      ),
      new Version(
        35,
        Int32Array.from([6, 30, 54, 78, 102, 126, 150]),
        new ECBlocks(30, new ECB(12, 121), new ECB(7, 122)),
        new ECBlocks(28, new ECB(12, 47), new ECB(26, 48)),
        new ECBlocks(30, new ECB(39, 24), new ECB(14, 25)),
        new ECBlocks(30, new ECB(22, 15), new ECB(41, 16))
      ),
      new Version(
        36,
        Int32Array.from([6, 24, 50, 76, 102, 128, 154]),
        new ECBlocks(30, new ECB(6, 121), new ECB(14, 122)),
        new ECBlocks(28, new ECB(6, 47), new ECB(34, 48)),
        new ECBlocks(30, new ECB(46, 24), new ECB(10, 25)),
        new ECBlocks(30, new ECB(2, 15), new ECB(64, 16))
      ),
      new Version(
        37,
        Int32Array.from([6, 28, 54, 80, 106, 132, 158]),
        new ECBlocks(30, new ECB(17, 122), new ECB(4, 123)),
        new ECBlocks(28, new ECB(29, 46), new ECB(14, 47)),
        new ECBlocks(30, new ECB(49, 24), new ECB(10, 25)),
        new ECBlocks(30, new ECB(24, 15), new ECB(46, 16))
      ),
      new Version(
        38,
        Int32Array.from([6, 32, 58, 84, 110, 136, 162]),
        new ECBlocks(30, new ECB(4, 122), new ECB(18, 123)),
        new ECBlocks(28, new ECB(13, 46), new ECB(32, 47)),
        new ECBlocks(30, new ECB(48, 24), new ECB(14, 25)),
        new ECBlocks(30, new ECB(42, 15), new ECB(32, 16))
      ),
      new Version(
        39,
        Int32Array.from([6, 26, 54, 82, 110, 138, 166]),
        new ECBlocks(30, new ECB(20, 117), new ECB(4, 118)),
        new ECBlocks(28, new ECB(40, 47), new ECB(7, 48)),
        new ECBlocks(30, new ECB(43, 24), new ECB(22, 25)),
        new ECBlocks(30, new ECB(10, 15), new ECB(67, 16))
      ),
      new Version(
        40,
        Int32Array.from([6, 30, 58, 86, 114, 142, 170]),
        new ECBlocks(30, new ECB(19, 118), new ECB(6, 119)),
        new ECBlocks(28, new ECB(18, 47), new ECB(31, 48)),
        new ECBlocks(30, new ECB(34, 24), new ECB(34, 25)),
        new ECBlocks(30, new ECB(20, 15), new ECB(61, 16))
      ),
    ];
  }
}

/**
 * Format information (error correction level and mask pattern)
 */
export class FormatInformation {
  private static FORMAT_INFO_DECODE_LOOKUP = [
    [0x5412, 0x00],
    [0x5125, 0x01],
    [0x5e7c, 0x02],
    [0x5b4b, 0x03],
    [0x45f9, 0x04],
    [0x40ce, 0x05],
    [0x4f97, 0x06],
    [0x4aa0, 0x07],
    [0x77c4, 0x08],
    [0x72f3, 0x09],
    [0x7daa, 0x0a],
    [0x789d, 0x0b],
    [0x662f, 0x0c],
    [0x6318, 0x0d],
    [0x6c41, 0x0e],
    [0x6976, 0x0f],
    [0x1689, 0x10],
    [0x13be, 0x11],
    [0x1ce7, 0x12],
    [0x19d0, 0x13],
    [0x0762, 0x14],
    [0x0255, 0x15],
    [0x0d0c, 0x16],
    [0x083b, 0x17],
    [0x355f, 0x18],
    [0x3068, 0x19],
    [0x3f31, 0x1a],
    [0x3a06, 0x1b],
    [0x24b4, 0x1c],
    [0x2183, 0x1d],
    [0x2eda, 0x1e],
    [0x2bed, 0x1f],
  ];

  private constructor(
    private errorCorrectionLevel: ErrorCorrectionLevel,
    private dataMask: number
  ) {}

  static numBitsDiffering(a: number, b: number): number {
    let count = 0;
    let value = a ^ b;
    while (value !== 0) {
      count++;
      value &= value - 1;
    }
    return count;
  }

  static decodeFormatInformation(
    maskedFormatInfo1: number,
    maskedFormatInfo2: number
  ): FormatInformation | null {
    const formatInfo = FormatInformation.doDecodeFormatInformation(
      maskedFormatInfo1,
      maskedFormatInfo2
    );
    if (formatInfo !== null) return formatInfo;
    return FormatInformation.doDecodeFormatInformation(
      maskedFormatInfo1 ^ 0x5412,
      maskedFormatInfo2 ^ 0x5412
    );
  }

  private static doDecodeFormatInformation(
    maskedFormatInfo1: number,
    maskedFormatInfo2: number
  ): FormatInformation | null {
    let bestDifference = Number.MAX_SAFE_INTEGER;
    let bestFormatInfo = 0;
    for (const decodeInfo of FormatInformation.FORMAT_INFO_DECODE_LOOKUP) {
      const targetInfo = decodeInfo[0];
      if (targetInfo === maskedFormatInfo1 || targetInfo === maskedFormatInfo2) {
        return new FormatInformation(
          ErrorCorrectionLevel.forBits((decodeInfo[1] >> 3) & 0x03),
          decodeInfo[1] & 0x07
        );
      }
      let bitsDifference = FormatInformation.numBitsDiffering(maskedFormatInfo1, targetInfo);
      if (bitsDifference < bestDifference) {
        bestFormatInfo = decodeInfo[1];
        bestDifference = bitsDifference;
      }
      if (maskedFormatInfo1 !== maskedFormatInfo2) {
        bitsDifference = FormatInformation.numBitsDiffering(maskedFormatInfo2, targetInfo);
        if (bitsDifference < bestDifference) {
          bestFormatInfo = decodeInfo[1];
          bestDifference = bitsDifference;
        }
      }
    }
    if (bestDifference <= 3) {
      return new FormatInformation(
        ErrorCorrectionLevel.forBits((bestFormatInfo >> 3) & 0x03),
        bestFormatInfo & 0x07
      );
    }
    return null;
  }

  getErrorCorrectionLevel(): ErrorCorrectionLevel {
    return this.errorCorrectionLevel;
  }

  getDataMask(): number {
    return this.dataMask;
  }

  hashCode(): number {
    return (this.errorCorrectionLevel.getValue() << 3) | this.dataMask;
  }

  equals(o: any): boolean {
    if (!(o instanceof FormatInformation)) return false;
    return this.errorCorrectionLevel.equals(o.errorCorrectionLevel) && this.dataMask === o.dataMask;
  }
}

/**
 * Data mask patterns for QR codes
 */
// biome-ignore lint/complexity/noStaticOnlyClass: Ported from ZXing Java library, maintaining original structure
export class DataMask {
  private static DATA_MASKS: ((i: number, j: number) => boolean)[] = [
    (i, j) => ((i + j) & 0x01) === 0,
    (i, _j) => (i & 0x01) === 0,
    (_i, j) => j % 3 === 0,
    (i, j) => (i + j) % 3 === 0,
    (i, j) => ((((i / 2) | 0) + ((j / 3) | 0)) & 0x01) === 0,
    (i, j) => ((i * j) & 0x01) + ((i * j) % 3) === 0,
    (i, j) => ((((i * j) & 0x01) + ((i * j) % 3)) & 0x01) === 0,
    (i, j) => ((((i + j) & 0x01) + ((i * j) % 3)) & 0x01) === 0,
  ];

  static values(): ((i: number, j: number) => boolean)[] {
    return DataMask.DATA_MASKS;
  }

  static isMasked(reference: number, i: number, j: number): boolean {
    return DataMask.DATA_MASKS[reference](i, j);
  }

  static unmaskBitMatrix(bits: BitMatrix, dimension: number, reference: number): void {
    for (let i = 0; i < dimension; i++) {
      for (let j = 0; j < dimension; j++) {
        if (DataMask.isMasked(reference, i, j)) {
          bits.flip(j, i);
        }
      }
    }
  }
}
