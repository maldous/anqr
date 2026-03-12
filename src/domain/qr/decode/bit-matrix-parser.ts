import type { BitMatrix } from './bit-matrix';
import { FormatException } from './exceptions';
import { DataMask, FormatInformation, Version } from './qr-version';
import { accumulateCodewordBit } from './qr-data-decoder._internal';

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
    const state = { currentByte: 0, bitsRead: 0, resultOffset: 0 };
    const dimension = this.bitMatrix.getHeight();

    let j = dimension - 1;
    while (j > 0) {
      if (j === 6) j--;
      for (let count = 0; count < dimension; count++) {
        const i = readingUp ? dimension - 1 - count : count;
        for (let col = 0; col < 2; col++) {
          accumulateCodewordBit(this.bitMatrix, functionPattern, j, col, i, state, result);
        }
      }
      readingUp = !readingUp;
      j -= 2;
    }
    if (state.resultOffset !== version.getTotalCodewords()) {
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
    for (let row = 0; row < dimension; row++) {
      for (let col = row + 1; col < dimension; col++) {
        if (this.bitMatrix.get(row, col) !== this.bitMatrix.get(col, row)) {
          this.bitMatrix.flip(col, row);
          this.bitMatrix.flip(row, col);
        }
      }
    }
  }
}
