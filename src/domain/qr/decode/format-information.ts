import { ErrorCorrectionLevel } from './error-correction-level';

/**
 * Format information (error correction level and mask pattern)
 */
export class FormatInformation {
  private static readonly FORMAT_INFO_DECODE_LOOKUP = [
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
    private readonly errorCorrectionLevel: ErrorCorrectionLevel,
    private readonly dataMask: number
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

  equals(o: unknown): boolean {
    if (!(o instanceof FormatInformation)) return false;
    return this.errorCorrectionLevel.equals(o.errorCorrectionLevel) && this.dataMask === o.dataMask;
  }
}
