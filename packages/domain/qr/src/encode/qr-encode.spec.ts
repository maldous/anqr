import { describe, it, expect } from "vitest";
import { EXP_TABLE, LOG_TABLE } from "./exp-table";
import { gexp } from "./gexp";
import { glog } from "./glog";
import { base64DecodeChar } from "./base64-decode-char";
import { QRErrorCorrectionLevel } from "./qr-error-correction-level.const";
import { QRMode } from "./qr-mode.const";
import { LENGTH_BITS } from "./length-bits";
import { getLengthInBits } from "./get-length-in-bits";
import { calculateModeDataBits } from "./calculate-mode-data-bits";
import { scanNumericRun } from "./scan-numeric-run";
import { scanAlphanumericRun } from "./scan-alphanumeric-run";
import { scanByteRunEnd } from "./scan-byte-run-end";
import { getCompatibleMode } from "./get-compatible-mode";
import { defaultStringToBytes } from "./default-string-to-bytes";
import { interleaveCodewords } from "./interleave-codewords";
import { qrBitBuffer } from "./bit-buffer";

describe("domain/qr/encode", () => {
  describe("EXP_TABLE / LOG_TABLE", () => {
    it("EXP_TABLE has 256 entries", () => {
      expect(EXP_TABLE).toHaveLength(256);
    });

    it("LOG_TABLE has 256 entries", () => {
      expect(LOG_TABLE).toHaveLength(256);
    });

    it("EXP_TABLE[0] is 1", () => {
      expect(EXP_TABLE[0]).toBe(1);
    });

    it("first 8 entries are powers of 2", () => {
      for (let i = 0; i < 8; i++) {
        expect(EXP_TABLE[i]).toBe(1 << i);
      }
    });

    it("all EXP_TABLE values are in GF(2^8) range [0, 255]", () => {
      for (let i = 0; i < 256; i++) {
        expect(EXP_TABLE[i]).toBeGreaterThanOrEqual(0);
        expect(EXP_TABLE[i]).toBeLessThanOrEqual(255);
      }
    });

    it("LOG_TABLE is the inverse of EXP_TABLE for 0..254", () => {
      for (let i = 0; i < 255; i++) {
        expect(LOG_TABLE[EXP_TABLE[i]]).toBe(i);
      }
    });
  });

  describe("gexp", () => {
    it("gexp(0) returns EXP_TABLE[0]", () => {
      expect(gexp(0)).toBe(EXP_TABLE[0]);
    });

    it("gexp(1) returns EXP_TABLE[1]", () => {
      expect(gexp(1)).toBe(EXP_TABLE[1]);
    });

    it("gexp(n) returns EXP_TABLE[n] for n in [0, 255]", () => {
      for (let n = 0; n <= 255; n++) {
        expect(gexp(n)).toBe(EXP_TABLE[n]);
      }
    });

    it("wraps large exponents using GF period 255", () => {
      expect(gexp(256)).toBe(gexp(1));
      expect(gexp(510)).toBe(gexp(255));
    });

    it("handles negative exponents", () => {
      const result = gexp(-1);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(255);
    });
  });

  describe("glog", () => {
    it("glog(1) returns 0", () => {
      expect(glog(1)).toBe(0);
    });

    it("glog(n) returns LOG_TABLE[n] for n in [1, 255]", () => {
      for (let n = 1; n <= 255; n++) {
        expect(glog(n)).toBe(LOG_TABLE[n]);
      }
    });

    it("throws for n < 1", () => {
      expect(() => glog(0)).toThrow("glog(0)");
      expect(() => glog(-1)).toThrow("glog(-1)");
    });

    it("round-trips with gexp for 1..254", () => {
      for (let i = 1; i <= 254; i++) {
        expect(gexp(glog(i))).toBe(i);
      }
    });
  });

  describe("base64DecodeChar", () => {
    it("decodes uppercase A-Z to 0-25", () => {
      expect(base64DecodeChar(0x41)).toBe(0);
      expect(base64DecodeChar(0x5a)).toBe(25);
      expect(base64DecodeChar(0x4d)).toBe(12);
    });

    it("decodes lowercase a-z to 26-51", () => {
      expect(base64DecodeChar(0x61)).toBe(26);
      expect(base64DecodeChar(0x7a)).toBe(51);
      expect(base64DecodeChar(0x6d)).toBe(38);
    });

    it("decodes digits 0-9 to 52-61", () => {
      expect(base64DecodeChar(0x30)).toBe(52);
      expect(base64DecodeChar(0x39)).toBe(61);
    });

    it("decodes + to 62", () => {
      expect(base64DecodeChar(0x2b)).toBe(62);
    });

    it("decodes / to 63", () => {
      expect(base64DecodeChar(0x2f)).toBe(63);
    });

    it("throws for invalid characters", () => {
      expect(() => base64DecodeChar(0x00)).toThrow();
      expect(() => base64DecodeChar(0x20)).toThrow();
      expect(() => base64DecodeChar(0x3d)).toThrow();
    });
  });

  describe("QRErrorCorrectionLevel", () => {
    it("L is 1", () => {
      expect(QRErrorCorrectionLevel.L).toBe(1);
    });

    it("M is 0", () => {
      expect(QRErrorCorrectionLevel.M).toBe(0);
    });

    it("Q is 3", () => {
      expect(QRErrorCorrectionLevel.Q).toBe(3);
    });

    it("H is 2", () => {
      expect(QRErrorCorrectionLevel.H).toBe(2);
    });
  });

  describe("QRMode", () => {
    it("MODE_NUMBER is 1", () => {
      expect(QRMode.MODE_NUMBER).toBe(1);
    });

    it("MODE_ALPHA_NUM is 2", () => {
      expect(QRMode.MODE_ALPHA_NUM).toBe(2);
    });

    it("MODE_8BIT_BYTE is 4", () => {
      expect(QRMode.MODE_8BIT_BYTE).toBe(4);
    });

    it("MODE_KANJI is 8", () => {
      expect(QRMode.MODE_KANJI).toBe(8);
    });
  });

  describe("LENGTH_BITS", () => {
    it("numeric mode has [10, 12, 14]", () => {
      expect(LENGTH_BITS[1]).toEqual([10, 12, 14]);
    });

    it("alphanumeric mode has [9, 11, 13]", () => {
      expect(LENGTH_BITS[2]).toEqual([9, 11, 13]);
    });

    it("byte mode has [8, 16, 16]", () => {
      expect(LENGTH_BITS[4]).toEqual([8, 16, 16]);
    });

    it("kanji mode has [8, 10, 12]", () => {
      expect(LENGTH_BITS[8]).toEqual([8, 10, 12]);
    });
  });

  describe("getLengthInBits", () => {
    it("returns small-version bits for versions 1-9", () => {
      expect(getLengthInBits(1, 1)).toBe(10);
      expect(getLengthInBits(1, 9)).toBe(10);
      expect(getLengthInBits(4, 5)).toBe(8);
    });

    it("returns medium-version bits for versions 10-26", () => {
      expect(getLengthInBits(1, 10)).toBe(12);
      expect(getLengthInBits(1, 26)).toBe(12);
      expect(getLengthInBits(4, 15)).toBe(16);
    });

    it("returns large-version bits for versions 27-40", () => {
      expect(getLengthInBits(1, 27)).toBe(14);
      expect(getLengthInBits(1, 40)).toBe(14);
      expect(getLengthInBits(4, 35)).toBe(16);
    });

    it("throws for type < 1", () => {
      expect(() => getLengthInBits(1, 0)).toThrow("type:0");
    });

    it("throws for type >= 41", () => {
      expect(() => getLengthInBits(1, 41)).toThrow("type:41");
    });

    it("throws for invalid mode", () => {
      expect(() => getLengthInBits(3, 1)).toThrow("mode:3");
    });
  });

  describe("calculateModeDataBits", () => {
    it("numeric: 3 digits = 10 bits", () => {
      expect(calculateModeDataBits("numeric", 3)).toBe(10);
    });

    it("numeric: 1 digit = 4 bits", () => {
      expect(calculateModeDataBits("numeric", 1)).toBe(4);
    });

    it("numeric: 2 digits = 7 bits", () => {
      expect(calculateModeDataBits("numeric", 2)).toBe(7);
    });

    it("numeric: 10 digits = 34 bits", () => {
      expect(calculateModeDataBits("numeric", 10)).toBe(3 * 10 + 4);
    });

    it("alphanumeric: 2 chars = 11 bits", () => {
      expect(calculateModeDataBits("alphanumeric", 2)).toBe(11);
    });

    it("alphanumeric: 1 char = 6 bits", () => {
      expect(calculateModeDataBits("alphanumeric", 1)).toBe(6);
    });

    it("alphanumeric: 5 chars = 33 bits", () => {
      expect(calculateModeDataBits("alphanumeric", 5)).toBe(2 * 11 + 6);
    });

    it("byte: n chars = n*8 bits", () => {
      expect(calculateModeDataBits("byte", 1)).toBe(8);
      expect(calculateModeDataBits("byte", 10)).toBe(80);
    });

    it("kanji: n chars = n*13 bits", () => {
      expect(calculateModeDataBits("kanji", 1)).toBe(13);
      expect(calculateModeDataBits("kanji", 5)).toBe(65);
    });
  });

  describe("scanNumericRun", () => {
    it("scans consecutive digits from start", () => {
      expect(scanNumericRun("12345abc", 0)).toBe(5);
    });

    it("returns start if first char is not a digit", () => {
      expect(scanNumericRun("abc123", 0)).toBe(0);
    });

    it("scans from mid-string", () => {
      expect(scanNumericRun("abc123def", 3)).toBe(6);
    });

    it("scans to end of string", () => {
      expect(scanNumericRun("999", 0)).toBe(3);
    });

    it("handles empty string", () => {
      expect(scanNumericRun("", 0)).toBe(0);
    });
  });

  describe("scanAlphanumericRun", () => {
    it("scans uppercase alphanumeric chars", () => {
      expect(scanAlphanumericRun("HELLO", "HELLO", 0)).toBe(5);
    });

    it("stops at lowercase chars", () => {
      expect(scanAlphanumericRun("ABCdef", "ABCDEF", 0)).toBe(3);
    });

    it("includes digits", () => {
      expect(scanAlphanumericRun("A1B2", "A1B2", 0)).toBe(4);
    });

    it("includes special chars: space $%*+-./:", () => {
      expect(scanAlphanumericRun("A B", "A B", 0)).toBe(3);
      expect(scanAlphanumericRun("A$B", "A$B", 0)).toBe(3);
      expect(scanAlphanumericRun("A:B", "A:B", 0)).toBe(3);
    });

    it("returns start when no alphanumeric at start", () => {
      expect(scanAlphanumericRun("abc", "ABC", 0)).toBe(0);
    });
  });

  describe("scanByteRunEnd", () => {
    it("scans until a long numeric run is found", () => {
      expect(scanByteRunEnd("abc1234", "ABC1234", 0)).toBe(3);
    });

    it("scans until a long alphanumeric run is found", () => {
      // cspell:disable-next-line
      expect(scanByteRunEnd("xABCDEF", "XABCDEF", 0)).toBe(1);
    });

    it("scans to end when no long runs found", () => {
      expect(scanByteRunEnd("ab", "AB", 0)).toBe(2);
    });

    it("handles empty string", () => {
      expect(scanByteRunEnd("", "", 0)).toBe(0);
    });
  });

  describe("getCompatibleMode", () => {
    it("auto-detects numeric for digit-only content", () => {
      expect(getCompatibleMode("12345", "auto")).toBe("numeric");
    });

    it("auto-detects alphanumeric for uppercase+digits", () => {
      expect(getCompatibleMode("HELLO123", "auto")).toBe("alphanumeric");
    });

    it("auto-detects byte for mixed case", () => {
      expect(getCompatibleMode("Hello", "auto")).toBe("byte");
    });

    it("validates numeric mode for digit content", () => {
      expect(getCompatibleMode("999", "numeric")).toBe("numeric");
    });

    it("falls back to byte when numeric mode requested for non-digits", () => {
      expect(getCompatibleMode("abc", "numeric")).toBe("byte");
    });

    it("validates alphanumeric mode", () => {
      expect(getCompatibleMode("ABC123", "alphanumeric")).toBe("alphanumeric");
    });

    it("falls back to byte when alphanumeric requested for lowercase", () => {
      expect(getCompatibleMode("abc", "alphanumeric")).toBe("byte");
    });

    it("returns kanji when kanji mode requested", () => {
      expect(getCompatibleMode("any", "kanji")).toBe("kanji");
    });

    it("returns byte when byte mode requested", () => {
      expect(getCompatibleMode("any", "byte")).toBe("byte");
    });
  });

  describe("defaultStringToBytes", () => {
    it("converts ASCII string to byte array", () => {
      expect(defaultStringToBytes("ABC")).toEqual([65, 66, 67]);
    });

    it("returns empty array for empty string", () => {
      expect(defaultStringToBytes("")).toEqual([]);
    });

    it("takes low byte of each code point", () => {
      expect(defaultStringToBytes("\x00")).toEqual([0]);
      expect(defaultStringToBytes("\xff")).toEqual([255]);
    });

    it("handles digits", () => {
      expect(defaultStringToBytes("123")).toEqual([49, 50, 51]);
    });
  });

  describe("interleaveCodewords", () => {
    it("interleaves single blocks", () => {
      const result = interleaveCodewords([[1, 2]], [[3, 4]], 2, 2, 4);
      expect(result).toEqual([1, 2, 3, 4]);
    });

    it("interleaves multiple DC blocks", () => {
      const result = interleaveCodewords(
        [
          [1, 2],
          [3, 4],
        ],
        [[5], [6]],
        2,
        1,
        6,
      );
      expect(result).toEqual([1, 3, 2, 4, 5, 6]);
    });

    it("handles unequal DC block lengths", () => {
      const result = interleaveCodewords(
        [
          [1, 2],
          [3, 4, 5],
        ],
        [[6], [7]],
        3,
        1,
        7,
      );
      expect(result).toEqual([1, 3, 2, 4, 5, 6, 7]);
    });

    it("handles empty EC data", () => {
      const result = interleaveCodewords([[1, 2]], [[]], 2, 0, 2);
      expect(result).toEqual([1, 2]);
    });
  });

  describe("qrBitBuffer", () => {
    it("starts with 0 bits", () => {
      const buf = qrBitBuffer();
      expect(buf.getLengthInBits()).toBe(0);
    });

    it("starts with empty buffer", () => {
      const buf = qrBitBuffer();
      expect(buf.getBuffer()).toEqual([]);
    });

    it("putBit adds individual bits", () => {
      const buf = qrBitBuffer();
      buf.putBit(true);
      buf.putBit(false);
      buf.putBit(true);
      expect(buf.getLengthInBits()).toBe(3);
      expect(buf.getAt(0)).toBe(true);
      expect(buf.getAt(1)).toBe(false);
      expect(buf.getAt(2)).toBe(true);
    });

    it("put adds multi-bit values", () => {
      const buf = qrBitBuffer();
      buf.put(0b1010, 4);
      expect(buf.getLengthInBits()).toBe(4);
      expect(buf.getAt(0)).toBe(true);
      expect(buf.getAt(1)).toBe(false);
      expect(buf.getAt(2)).toBe(true);
      expect(buf.getAt(3)).toBe(false);
    });

    it("put with 8 bits fills one byte", () => {
      const buf = qrBitBuffer();
      buf.put(0xff, 8);
      expect(buf.getLengthInBits()).toBe(8);
      expect(buf.getBuffer()).toEqual([0xff]);
    });

    it("multiple puts accumulate correctly", () => {
      const buf = qrBitBuffer();
      buf.put(0b0001, 4);
      buf.put(0b1010, 4);
      expect(buf.getLengthInBits()).toBe(8);
      expect(buf.getBuffer()).toEqual([0b00011010]);
    });

    it("spans multiple bytes", () => {
      const buf = qrBitBuffer();
      buf.put(0xff, 8);
      buf.put(0x00, 8);
      expect(buf.getBuffer()).toEqual([0xff, 0x00]);
      expect(buf.getLengthInBits()).toBe(16);
    });

    it("getAt returns correct bit for cross-byte boundaries", () => {
      const buf = qrBitBuffer();
      buf.put(0b11110000, 8);
      buf.put(0b00001111, 8);
      expect(buf.getAt(7)).toBe(false);
      expect(buf.getAt(8)).toBe(false);
      expect(buf.getAt(11)).toBe(false);
      expect(buf.getAt(12)).toBe(true);
    });
  });
});
