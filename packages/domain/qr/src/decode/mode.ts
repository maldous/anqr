import { IllegalArgumentException } from "./exceptions";
import { ModeValue } from "./mode-value";
import { Version } from "./version";

/**
 * QR Code encoding mode
 */
export class Mode {
  private static readonly FOR_BITS = new Map<number, Mode>();

  static readonly TERMINATOR = new Mode(
    ModeValue.TERMINATOR,
    "TERMINATOR",
    Int32Array.from([0, 0, 0]),
    0x00,
  );
  static readonly NUMERIC = new Mode(
    ModeValue.NUMERIC,
    "NUMERIC",
    Int32Array.from([10, 12, 14]),
    0x01,
  );
  static readonly ALPHANUMERIC = new Mode(
    ModeValue.ALPHANUMERIC,
    "ALPHANUMERIC",
    Int32Array.from([9, 11, 13]),
    0x02,
  );
  static readonly STRUCTURED_APPEND = new Mode(
    ModeValue.STRUCTURED_APPEND,
    "STRUCTURED_APPEND",
    Int32Array.from([0, 0, 0]),
    0x03,
  );
  static readonly BYTE = new Mode(ModeValue.BYTE, "BYTE", Int32Array.from([8, 16, 16]), 0x04);
  static readonly ECI = new Mode(ModeValue.ECI, "ECI", Int32Array.from([0, 0, 0]), 0x07);
  static readonly KANJI = new Mode(ModeValue.KANJI, "KANJI", Int32Array.from([8, 10, 12]), 0x08);
  static readonly FNC1_FIRST_POSITION = new Mode(
    ModeValue.FNC1_FIRST_POSITION,
    "FNC1_FIRST_POSITION",
    Int32Array.from([0, 0, 0]),
    0x05,
  );
  static readonly FNC1_SECOND_POSITION = new Mode(
    ModeValue.FNC1_SECOND_POSITION,
    "FNC1_SECOND_POSITION",
    Int32Array.from([0, 0, 0]),
    0x09,
  );
  static readonly HANZI = new Mode(ModeValue.HANZI, "HANZI", Int32Array.from([8, 10, 12]), 0x0d);

  private constructor(
    private readonly value: ModeValue,
    private readonly stringValue: string,
    private readonly characterCountBitsForVersions: Int32Array,
    private readonly bits: number,
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

  equals(o: unknown): boolean {
    if (!(o instanceof Mode)) return false;
    return this.value === o.value;
  }

  toString(): string {
    return this.stringValue;
  }
}
