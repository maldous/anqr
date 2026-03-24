import { describe, it, expect } from "vitest";
import { gfAdd } from "./gf-add";
import { gfAddOrSubtract } from "./gf-add-or-subtract";
import { hammingDistance } from "./hamming-distance";
import { polyIsZero } from "./poly-is-zero";
import { polyDegree } from "./poly-degree";
import { polyTrimLeadingZeros } from "./poly-trim-leading-zeros";
import { polyGetCoeff } from "./poly-get-coeff";
import { formatPolyDegreeLabel } from "./format-poly-degree-label";
import { formatPolyTermSign } from "./format-poly-term-sign";
import { detectEncodingMode } from "./adapter-detect-encoding-mode";
import { isFinderPatternRatio } from "./is-finder-pattern-ratio";
import { patternAboutEquals } from "./pattern-about-equals";
import { overlapsFinderRegion } from "./overlaps-finder-region";
import { expandBlockDefinitions } from "./expand-block-definitions";
import { deinterleaveByBlock } from "./deinterleave-by-block";
import { buildRSBlockConfigs } from "./build-rs-block-configs";
import { advanceVerticalScanState } from "./advance-vertical-scan-state";
import { checkTimingPosition } from "./check-timing-position";
import { BitSource } from "./bit-source";
import { BarcodeFormat } from "./barcode-format";
import { ErrorCorrectionLevelValue } from "./error-correction-level-value";
import { DARK_CORE_MODULES } from "./dark-core-modules";
import { WHITE_RING_MODULES } from "./white-ring-modules";
import { scoreAlignmentCenter } from "./score-alignment-center";
import { compareFinderModule } from "./compare-finder-module";
import { computeGrayscale } from "./compute-grayscale";

describe("domain/qr/decode", () => {
  // ── GF(256) arithmetic ─────────────────────────────────────────

  describe("gfAdd", () => {
    it("returns XOR of two values", () => {
      expect(gfAdd(0b1010, 0b1100)).toBe(0b0110);
    });

    it("returns identity when adding zero", () => {
      expect(gfAdd(42, 0)).toBe(42);
      expect(gfAdd(0, 42)).toBe(42);
    });

    it("returns zero when adding self (GF property)", () => {
      expect(gfAdd(255, 255)).toBe(0);
      expect(gfAdd(1, 1)).toBe(0);
    });
  });

  describe("gfAddOrSubtract", () => {
    it("is equivalent to XOR", () => {
      expect(gfAddOrSubtract(0b1010, 0b1100)).toBe(0b0110);
    });

    it("is same as gfAdd (addition equals subtraction in GF(2^n))", () => {
      expect(gfAddOrSubtract(100, 200)).toBe(gfAdd(100, 200));
    });
  });

  // ── Hamming distance ───────────────────────────────────────────

  describe("hammingDistance", () => {
    it("returns 0 for identical values", () => {
      expect(hammingDistance(0, 0)).toBe(0);
      expect(hammingDistance(255, 255)).toBe(0);
    });

    it("counts single bit difference", () => {
      expect(hammingDistance(0b0000, 0b0001)).toBe(1);
      expect(hammingDistance(0b1000, 0b0000)).toBe(1);
    });

    it("counts multiple bit differences", () => {
      expect(hammingDistance(0b1010, 0b0101)).toBe(4);
    });

    it("handles all bits different in a byte", () => {
      expect(hammingDistance(0x00, 0xff)).toBe(8);
    });

    it("handles large values", () => {
      expect(hammingDistance(0xffff, 0x0000)).toBe(16);
    });
  });

  // ── Polynomial operations ──────────────────────────────────────

  describe("polyIsZero", () => {
    it("returns true for all-zero polynomial", () => {
      expect(polyIsZero([0, 0, 0])).toBe(true);
    });

    it("returns false for non-zero polynomial", () => {
      expect(polyIsZero([0, 1, 0])).toBe(false);
    });

    it("returns true for single zero element", () => {
      expect(polyIsZero([0])).toBe(true);
    });

    it("returns true for empty polynomial", () => {
      expect(polyIsZero([])).toBe(true);
    });
  });

  describe("polyDegree", () => {
    it("returns 0 for constant polynomial", () => {
      expect(polyDegree([5])).toBe(0);
    });

    it("returns 1 for linear polynomial (high-to-low)", () => {
      expect(polyDegree([3, 1])).toBe(1);
    });

    it("returns 2 for quadratic polynomial", () => {
      expect(polyDegree([2, 0, 1])).toBe(2);
    });

    it("returns 0 for zero polynomial", () => {
      expect(polyDegree([0, 0, 0])).toBe(0);
    });

    it("skips leading zeros", () => {
      expect(polyDegree([0, 0, 3, 1])).toBe(1);
    });

    it("returns 0 for empty polynomial", () => {
      expect(polyDegree([])).toBe(0);
    });
  });

  describe("polyTrimLeadingZeros", () => {
    it("returns same array when no leading zeros", () => {
      const poly = [3, 2, 1];
      expect(polyTrimLeadingZeros(poly)).toBe(poly);
    });

    it("trims leading zeros", () => {
      expect(polyTrimLeadingZeros([0, 0, 3, 1])).toEqual([3, 1]);
    });

    it("keeps at least one element for all-zero poly", () => {
      expect(polyTrimLeadingZeros([0, 0, 0])).toEqual([0]);
    });

    it("returns single element unchanged", () => {
      const poly = [5];
      expect(polyTrimLeadingZeros(poly)).toBe(poly);
    });
  });

  describe("polyGetCoeff", () => {
    it("gets constant term (x^0) from high-to-low poly", () => {
      expect(polyGetCoeff([2, 3, 5], 0)).toBe(5);
    });

    it("gets x^1 coefficient", () => {
      expect(polyGetCoeff([2, 3, 5], 1)).toBe(3);
    });

    it("gets highest degree coefficient", () => {
      expect(polyGetCoeff([2, 3, 5], 2)).toBe(2);
    });

    it("returns 0 for degree beyond polynomial", () => {
      expect(polyGetCoeff([2, 3], 5)).toBe(0);
    });

    it("returns 0 for negative degree", () => {
      expect(polyGetCoeff([1, 2], -1)).toBe(0);
    });
  });

  // ── Format poly helpers ────────────────────────────────────────

  describe("formatPolyDegreeLabel", () => {
    it("returns empty string for degree 0", () => {
      expect(formatPolyDegreeLabel(0)).toBe("");
    });

    it("returns 'x' for degree 1", () => {
      expect(formatPolyDegreeLabel(1)).toBe("x");
    });

    it("returns 'x^n' for degree > 1", () => {
      expect(formatPolyDegreeLabel(2)).toBe("x^2");
      expect(formatPolyDegreeLabel(10)).toBe("x^10");
    });
  });

  describe("formatPolyTermSign", () => {
    it("returns ' - ' for negative coefficient", () => {
      expect(formatPolyTermSign(-3, true)).toBe(" - ");
      expect(formatPolyTermSign(-1, false)).toBe(" - ");
    });

    it("returns ' + ' for positive with existing terms", () => {
      expect(formatPolyTermSign(5, true)).toBe(" + ");
    });

    it("returns empty string for positive first term", () => {
      expect(formatPolyTermSign(5, false)).toBe("");
    });
  });

  // ── Encoding detection ─────────────────────────────────────────

  describe("detectEncodingMode", () => {
    it("detects numeric mode for digits only", () => {
      expect(detectEncodingMode("12345")).toBe("numeric");
    });

    it("detects alphanumeric mode for uppercase + digits + specials", () => {
      expect(detectEncodingMode("HELLO 123")).toBe("alphanumeric");
      expect(detectEncodingMode("A$B%C")).toBe("alphanumeric");
    });

    it("detects kanji mode for Japanese characters", () => {
      expect(detectEncodingMode("こんにちは")).toBe("kanji");
      expect(detectEncodingMode("漢字")).toBe("kanji");
    });

    it("detects byte mode for lowercase text", () => {
      expect(detectEncodingMode("hello")).toBe("byte");
    });

    it("detects byte mode for mixed content without kanji", () => {
      expect(detectEncodingMode("Hello World!")).toBe("byte");
    });
  });

  // ── Finder pattern detection ───────────────────────────────────

  describe("isFinderPatternRatio", () => {
    it("accepts valid 1:1:3:1:1 ratio", () => {
      expect(isFinderPatternRatio([10, 10, 30, 10, 10])).toBe(true);
    });

    it("accepts ratio with some tolerance", () => {
      expect(isFinderPatternRatio([9, 11, 29, 10, 11])).toBe(true);
    });

    it("rejects invalid ratio", () => {
      expect(isFinderPatternRatio([10, 10, 10, 10, 10])).toBe(false);
    });

    it("rejects too small total (< 7)", () => {
      expect(isFinderPatternRatio([1, 1, 1, 1, 1])).toBe(false);
    });

    it("accepts minimum valid ratio", () => {
      expect(isFinderPatternRatio([1, 1, 3, 1, 1])).toBe(true);
    });
  });

  describe("patternAboutEquals", () => {
    it("returns true for nearby position with similar module size", () => {
      expect(patternAboutEquals(10, 10, 5, 5, 10, 10)).toBe(true);
    });

    it("returns true for position within module size distance", () => {
      expect(patternAboutEquals(10, 10, 5, 5, 14, 14)).toBe(true);
    });

    it("returns false for distant position", () => {
      expect(patternAboutEquals(10, 10, 5, 5, 20, 20)).toBe(false);
    });

    it("returns false when module sizes differ too much", () => {
      expect(patternAboutEquals(10, 10, 2, 100, 10, 10)).toBe(false);
    });
  });

  describe("overlapsFinderRegion", () => {
    it("detects top-left finder region", () => {
      expect(overlapsFinderRegion(4, 4, 21)).toBe(true);
    });

    it("detects top-right finder region", () => {
      expect(overlapsFinderRegion(15, 4, 21)).toBe(true);
    });

    it("detects bottom-left finder region", () => {
      expect(overlapsFinderRegion(4, 15, 21)).toBe(true);
    });

    it("returns false for center of QR code", () => {
      expect(overlapsFinderRegion(10, 10, 21)).toBe(false);
    });

    it("returns false for bottom-right (no finder there)", () => {
      expect(overlapsFinderRegion(15, 15, 21)).toBe(false);
    });
  });

  // ── Block handling ─────────────────────────────────────────────

  describe("expandBlockDefinitions", () => {
    it("expands a single block group", () => {
      const result = expandBlockDefinitions([[1, 26, 19]]);
      expect(result.numBlocks).toBe(1);
      expect(result.blockDataSizes).toEqual([19]);
      expect(result.blockEccSizes).toEqual([7]);
      expect(result.maxData).toBe(19);
      expect(result.maxEcc).toBe(7);
    });

    it("expands multiple blocks in a group", () => {
      const result = expandBlockDefinitions([[2, 44, 34]]);
      expect(result.numBlocks).toBe(2);
      expect(result.blockDataSizes).toEqual([34, 34]);
      expect(result.blockEccSizes).toEqual([10, 10]);
    });

    it("expands mixed block groups", () => {
      const result = expandBlockDefinitions([
        [2, 44, 34],
        [1, 46, 36],
      ]);
      expect(result.numBlocks).toBe(3);
      expect(result.blockDataSizes).toEqual([34, 34, 36]);
      expect(result.blockEccSizes).toEqual([10, 10, 10]);
    });
  });

  describe("deinterleaveByBlock", () => {
    it("de-interleaves equal-size blocks", () => {
      const { blocks, nextIdx } = deinterleaveByBlock(
        [1, 2, 3, 4, 5, 6],
        [3, 3],
        3,
        0,
      );
      expect(blocks).toEqual([
        [1, 3, 5],
        [2, 4, 6],
      ]);
      expect(nextIdx).toBe(6);
    });

    it("de-interleaves unequal blocks", () => {
      const { blocks, nextIdx } = deinterleaveByBlock(
        [1, 2, 3, 4, 5],
        [2, 3],
        3,
        0,
      );
      expect(blocks[0]).toEqual([1, 3]);
      expect(blocks[1]).toEqual([2, 4, 5]);
      expect(nextIdx).toBe(5);
    });

    it("respects startIdx offset", () => {
      const { blocks } = deinterleaveByBlock(
        [10, 20, 1, 2, 3, 4],
        [2, 2],
        2,
        2,
      );
      expect(blocks).toEqual([
        [1, 3],
        [2, 4],
      ]);
    });
  });

  describe("buildRSBlockConfigs", () => {
    it("builds configs from a single group", () => {
      const configs = buildRSBlockConfigs([[1, 26, 19]]);
      expect(configs).toEqual([{ dataCount: 19, eccCount: 7 }]);
    });

    it("builds configs from multiple blocks per group", () => {
      const configs = buildRSBlockConfigs([[2, 44, 34]]);
      expect(configs).toHaveLength(2);
      expect(configs[0]).toEqual({ dataCount: 34, eccCount: 10 });
      expect(configs[1]).toEqual({ dataCount: 34, eccCount: 10 });
    });

    it("builds configs from mixed groups", () => {
      const configs = buildRSBlockConfigs([
        [1, 26, 19],
        [1, 44, 34],
      ]);
      expect(configs).toEqual([
        { dataCount: 19, eccCount: 7 },
        { dataCount: 34, eccCount: 10 },
      ]);
    });
  });

  // ── Scanner helpers ────────────────────────────────────────────

  describe("advanceVerticalScanState", () => {
    it("increments center count on dark pixel in center state", () => {
      const counts = [0, 0, 0, 0, 0];
      const newState = advanceVerticalScanState(true, 2, counts, 2, 3, 4);
      expect(newState).toBe(2);
      expect(counts[2]).toBe(1);
    });

    it("transitions from center to white on light pixel", () => {
      const counts = [0, 0, 5, 0, 0];
      const newState = advanceVerticalScanState(false, 2, counts, 2, 3, 4);
      expect(newState).toBe(3);
      expect(counts[3]).toBe(1);
    });

    it("stays in white state on light pixel", () => {
      const counts = [0, 0, 5, 1, 0];
      const newState = advanceVerticalScanState(false, 3, counts, 2, 3, 4);
      expect(newState).toBe(3);
      expect(counts[3]).toBe(2);
    });

    it("transitions from white to outer on dark pixel", () => {
      const counts = [0, 0, 5, 2, 0];
      const newState = advanceVerticalScanState(true, 3, counts, 2, 3, 4);
      expect(newState).toBe(4);
      expect(counts[4]).toBe(1);
    });

    it("returns -1 when outer state sees light pixel (scan complete)", () => {
      const counts = [0, 0, 5, 2, 3];
      const newState = advanceVerticalScanState(false, 4, counts, 2, 3, 4);
      expect(newState).toBe(-1);
    });
  });

  describe("checkTimingPosition", () => {
    it("records no mismatch when even index is dark", () => {
      const matrix = [[true]];
      const mismatches: Array<{ r: number; c: number; exp: 0 | 1; got: 0 | 1 }> = [];
      checkTimingPosition(matrix, 0, 0, 0, mismatches);
      expect(mismatches).toHaveLength(0);
    });

    it("records no mismatch when odd index is light", () => {
      const matrix = [[false]];
      const mismatches: Array<{ r: number; c: number; exp: 0 | 1; got: 0 | 1 }> = [];
      checkTimingPosition(matrix, 0, 0, 1, mismatches);
      expect(mismatches).toHaveLength(0);
    });

    it("records mismatch when even index is light", () => {
      const matrix = [[false]];
      const mismatches: Array<{ r: number; c: number; exp: 0 | 1; got: 0 | 1 }> = [];
      checkTimingPosition(matrix, 0, 0, 0, mismatches);
      expect(mismatches).toHaveLength(1);
      expect(mismatches[0]).toEqual({ r: 0, c: 0, exp: 1, got: 0 });
    });

    it("limits mismatches to 12", () => {
      const matrix = [[false]];
      const mismatches: Array<{ r: number; c: number; exp: 0 | 1; got: 0 | 1 }> = [];
      for (let i = 0; i < 15; i++) mismatches.push({ r: 0, c: 0, exp: 1, got: 0 });
      checkTimingPosition(matrix, 0, 0, 0, mismatches);
      expect(mismatches).toHaveLength(15);
    });
  });

  // ── BitSource ──────────────────────────────────────────────────

  describe("BitSource", () => {
    it("reports correct available bits", () => {
      const source = new BitSource(new Uint8Array([0xff, 0x00]));
      expect(source.available()).toBe(16);
    });

    it("reads 4 bits correctly", () => {
      const source = new BitSource(new Uint8Array([0b10110000]));
      expect(source.readBits(4)).toBe(0b1011);
      expect(source.available()).toBe(4);
    });

    it("reads full byte", () => {
      const source = new BitSource(new Uint8Array([0xab]));
      expect(source.readBits(8)).toBe(0xab);
    });

    it("reads across byte boundary", () => {
      const source = new BitSource(new Uint8Array([0b11110000, 0b10101010]));
      source.readBits(4);
      const value = source.readBits(8);
      expect(value).toBe(0b00001010);
    });

    it("reads multiple small chunks", () => {
      const source = new BitSource(new Uint8Array([0b11001010]));
      expect(source.readBits(2)).toBe(0b11);
      expect(source.readBits(2)).toBe(0b00);
      expect(source.readBits(4)).toBe(0b1010);
    });

    it("throws on overrun", () => {
      const source = new BitSource(new Uint8Array([0xff]));
      expect(() => source.readBits(9)).toThrow();
    });

    it("returns position diagnostics", () => {
      const source = new BitSource(new Uint8Array([0xff, 0x00]));
      source.readBits(4);
      const pos = source.getPosition();
      expect(pos.totalBitsRead).toBe(4);
      expect(pos.available).toBe(12);
    });

    it("reads 1-bit values", () => {
      const source = new BitSource(new Uint8Array([0b10100000]));
      expect(source.readBits(1)).toBe(1);
      expect(source.readBits(1)).toBe(0);
      expect(source.readBits(1)).toBe(1);
    });
  });

  // ── Constants and enums ────────────────────────────────────────

  describe("BarcodeFormat", () => {
    it("has QR_CODE member", () => {
      expect(BarcodeFormat.QR_CODE).toBe("QR_CODE");
    });

    it("has all common formats", () => {
      const values = Object.values(BarcodeFormat);
      expect(values).toContain("DATA_MATRIX");
      expect(values).toContain("CODE_128");
      expect(values.length).toBeGreaterThanOrEqual(10);
    });
  });

  describe("ErrorCorrectionLevelValue", () => {
    it("has L = 0", () => {
      expect(ErrorCorrectionLevelValue.L).toBe(0);
    });

    it("has M = 1", () => {
      expect(ErrorCorrectionLevelValue.M).toBe(1);
    });

    it("has Q = 2", () => {
      expect(ErrorCorrectionLevelValue.Q).toBe(2);
    });

    it("has H = 3", () => {
      expect(ErrorCorrectionLevelValue.H).toBe(3);
    });
  });

  describe("DARK_CORE_MODULES", () => {
    it("has 9 modules (3x3 core)", () => {
      expect(DARK_CORE_MODULES).toHaveLength(9);
    });

    it("includes center module (3,3)", () => {
      expect(DARK_CORE_MODULES).toContainEqual([3, 3]);
    });

    it("includes corner modules", () => {
      expect(DARK_CORE_MODULES).toContainEqual([2, 2]);
      expect(DARK_CORE_MODULES).toContainEqual([4, 4]);
    });
  });

  describe("WHITE_RING_MODULES", () => {
    it("has 12 modules (surrounding ring)", () => {
      expect(WHITE_RING_MODULES).toHaveLength(12);
    });

    it("includes ring positions", () => {
      expect(WHITE_RING_MODULES).toContainEqual([1, 2]);
      expect(WHITE_RING_MODULES).toContainEqual([5, 4]);
    });
  });

  // ── Alignment scoring ──────────────────────────────────────────

  describe("scoreAlignmentCenter", () => {
    function buildAlignmentMatrix(cx: number, cy: number, size: number): boolean[][] {
      const m: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const r = cy + dy;
          const c = cx + dx;
          if (r >= 0 && r < size && c >= 0 && c < size) {
            const expected = Math.max(Math.abs(dx), Math.abs(dy)) === 2 || (dx === 0 && dy === 0);
            m[r][c] = expected;
          }
        }
      }
      return m;
    }

    it("scores perfect alignment at 100%", () => {
      const matrix = buildAlignmentMatrix(10, 10, 21);
      const result = scoreAlignmentCenter(matrix, 10, 10);
      expect(result.good).toBe(25);
      expect(result.total).toBe(25);
      expect(result.mismatches).toHaveLength(0);
    });

    it("detects mismatches in imperfect alignment", () => {
      const matrix = buildAlignmentMatrix(10, 10, 21);
      matrix[10][10] = false;
      const result = scoreAlignmentCenter(matrix, 10, 10);
      expect(result.good).toBe(24);
      expect(result.mismatches.length).toBeGreaterThan(0);
    });

    it("handles empty matrix gracefully", () => {
      const matrix: boolean[][] = Array.from({ length: 21 }, () => Array(21).fill(false));
      const result = scoreAlignmentCenter(matrix, 10, 10);
      expect(result.total).toBe(25);
      expect(result.good).toBeLessThan(25);
    });
  });

  // ── Finder module comparison ───────────────────────────────────

  describe("compareFinderModule", () => {
    const finderPattern = [
      [1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 0, 1],
      [1, 0, 1, 1, 1, 0, 1],
      [1, 0, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1],
    ];

    it("returns true when module matches", () => {
      const matrix: boolean[][] = [[true]];
      const errors: string[] = [];
      expect(compareFinderModule(matrix, finderPattern, 0, 0, 0, 0, errors)).toBe(true);
      expect(errors).toHaveLength(0);
    });

    it("returns false and records error on mismatch", () => {
      const matrix: boolean[][] = [[false]];
      const errors: string[] = [];
      expect(compareFinderModule(matrix, finderPattern, 0, 0, 0, 0, errors)).toBe(false);
      expect(errors).toHaveLength(1);
    });

    it("limits errors to 5", () => {
      const matrix: boolean[][] = Array.from({ length: 7 }, () => Array(7).fill(false));
      const errors: string[] = [];
      for (let row = 0; row < 7; row++) {
        for (let col = 0; col < 7; col++) {
          compareFinderModule(matrix, finderPattern, row, col, 0, 0, errors);
        }
      }
      expect(errors.length).toBeLessThanOrEqual(5);
    });
  });

  // ── Grayscale computation ──────────────────────────────────────

  describe("computeGrayscale", () => {
    it("computes average of RGB for fully opaque pixel", () => {
      const pixels = new Uint8ClampedArray([90, 120, 150, 255]);
      expect(computeGrayscale(pixels, 0)).toBe(120);
    });

    it("returns 255 for fully transparent pixel", () => {
      const pixels = new Uint8ClampedArray([0, 0, 0, 0]);
      expect(computeGrayscale(pixels, 0)).toBe(255);
    });

    it("blends with white for semi-transparent pixel", () => {
      const pixels = new Uint8ClampedArray([0, 0, 0, 128]);
      const result = computeGrayscale(pixels, 0);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(255);
    });

    it("returns 0 for fully opaque black pixel", () => {
      const pixels = new Uint8ClampedArray([0, 0, 0, 255]);
      expect(computeGrayscale(pixels, 0)).toBe(0);
    });

    it("returns 255 for fully opaque white pixel", () => {
      const pixels = new Uint8ClampedArray([255, 255, 255, 255]);
      expect(computeGrayscale(pixels, 0)).toBe(255);
    });
  });
});
