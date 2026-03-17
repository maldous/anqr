import { IllegalArgumentException } from "./exceptions";
import { ErrorCorrectionLevelValue } from "./error-correction-level-value";

/**
 * Error correction level (L, M, Q, H)
 */
export class ErrorCorrectionLevel {
  private static readonly FOR_BITS = new Map<number, ErrorCorrectionLevel>();

  static readonly L = new ErrorCorrectionLevel(ErrorCorrectionLevelValue.L, "L", 0x01);
  static readonly M = new ErrorCorrectionLevel(ErrorCorrectionLevelValue.M, "M", 0x00);
  static readonly Q = new ErrorCorrectionLevel(ErrorCorrectionLevelValue.Q, "Q", 0x03);
  static readonly H = new ErrorCorrectionLevel(ErrorCorrectionLevelValue.H, "H", 0x02);

  private constructor(
    private readonly value: ErrorCorrectionLevelValue,
    private readonly stringValue: string,
    private readonly bits: number,
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

  equals(o: unknown): boolean {
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
      case "L":
        return ErrorCorrectionLevel.L;
      case "M":
        return ErrorCorrectionLevel.M;
      case "Q":
        return ErrorCorrectionLevel.Q;
      case "H":
        return ErrorCorrectionLevel.H;
      default:
        throw new IllegalArgumentException(`${s} not available`);
    }
  }
}
