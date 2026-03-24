import { describe, it, expect } from "vitest";
import { mulberry32 } from "./mulberry32";
import { hashStringToSeed } from "./hash-string-to-seed";
import { createSeededRandom } from "./create-seeded-random";
import { getModuleCount } from "./get-module-count";
import { getNumericBitsForDigits } from "./get-numeric-bits-for-digits";
import { pixelToIndex } from "./pixel-to-index";
import { indexToPixel } from "./index-to-pixel";
import { isFinderPattern } from "./is-finder-pattern";
import { isTimingPattern } from "./is-timing-pattern";
import { isAlignmentPattern } from "./is-alignment-pattern";
import { eccNumericToLevel } from "./ecc-numeric-to-level";
import { validateSuffixCharacters } from "./validate-suffix-characters";
import { validateSuffixCharset } from "./validate-suffix-charset";
import { validateNumericSuffix } from "./validate-numeric-suffix";
import { VALID_SUFFIX_CHARS } from "./valid-suffix-chars";
import { getBaseUrl } from "./get-base-url";
import { canUseFragmentSearch } from "./can-use-fragment-search";
import { analyzeUrlEfficiency } from "./analyze-url-efficiency";
import { acquireUint8Buffer } from "./acquire-uint8-buffer";
import { updateLruCache } from "./update-lru-cache";
import { basisToMatrix } from "./basis-to-matrix";
import { matrixRowToBytes } from "./matrix-row-to-bytes";
import { xorBasisVectors } from "./xor-basis-vectors";
import { buildSamplePoints } from "./build-sample-points";
import { resolveSupersampleLevel } from "./resolve-supersample-level";
import { resolveCleanupArea } from "./resolve-cleanup-area";
import { shouldRemoveComponent } from "./should-remove-component";
import { unflattenSelections } from "./unflatten-selections";
import { simulateInterleavingProtection } from "./simulate-interleaving-protection";
import { MIN_QART_VERSION } from "./min-qart-version";
import { MIN_ECC_HEADROOM_BYTES } from "./min-ecc-headroom-bytes";
import type { RSBasisVector } from "./rs-basis-vector.types";
import type { RSBlockInfo } from "./rs-block-info";

describe("domain/qr/qart", () => {
  // ── PRNG / hashing ─────────────────────────────────────────────

  describe("mulberry32", () => {
    it("produces deterministic sequence for same seed", () => {
      const rng1 = mulberry32(42);
      const rng2 = mulberry32(42);
      expect(rng1()).toBe(rng2());
      expect(rng1()).toBe(rng2());
    });

    it("produces different sequences for different seeds", () => {
      const rng1 = mulberry32(1);
      const rng2 = mulberry32(2);
      expect(rng1()).not.toBe(rng2());
    });

    it("produces values in [0, 1)", () => {
      const rng = mulberry32(12345);
      for (let i = 0; i < 100; i++) {
        const v = rng();
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThan(1);
      }
    });

    it("produces non-zero values", () => {
      const rng = mulberry32(99);
      const values = Array.from({ length: 10 }, () => rng());
      expect(values.some((v) => v > 0)).toBe(true);
    });
  });

  describe("hashStringToSeed", () => {
    it("returns deterministic hash for same string", () => {
      expect(hashStringToSeed("hello")).toBe(hashStringToSeed("hello"));
    });

    it("returns different hashes for different strings", () => {
      expect(hashStringToSeed("hello")).not.toBe(hashStringToSeed("world"));
    });

    it("returns unsigned 32-bit integer", () => {
      const hash = hashStringToSeed("test");
      expect(hash).toBeGreaterThanOrEqual(0);
      expect(hash).toBeLessThanOrEqual(0xffffffff);
    });

    it("handles empty string", () => {
      const hash = hashStringToSeed("");
      expect(hash).toBe(5381 >>> 0);
    });
  });

  describe("createSeededRandom", () => {
    it("produces deterministic sequence", () => {
      const rng1 = createSeededRandom(42);
      const rng2 = createSeededRandom(42);
      expect(rng1()).toBe(rng2());
      expect(rng1()).toBe(rng2());
    });

    it("produces values in [0, 1)", () => {
      const rng = createSeededRandom(100);
      for (let i = 0; i < 50; i++) {
        const v = rng();
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThan(1);
      }
    });

    it("produces different sequences for different seeds", () => {
      const rng1 = createSeededRandom(1);
      const rng2 = createSeededRandom(2);
      expect(rng1()).not.toBe(rng2());
    });
  });

  // ── Module count and bit calculations ──────────────────────────

  describe("getModuleCount", () => {
    it("returns 21 for version 1", () => {
      expect(getModuleCount(1)).toBe(21);
    });

    it("returns 25 for version 2", () => {
      expect(getModuleCount(2)).toBe(25);
    });

    it("returns 57 for version 10", () => {
      expect(getModuleCount(10)).toBe(57);
    });

    it("returns 177 for version 40", () => {
      expect(getModuleCount(40)).toBe(177);
    });
  });

  describe("getNumericBitsForDigits", () => {
    it("returns 0 for 0 digits", () => {
      expect(getNumericBitsForDigits(0)).toBe(0);
    });

    it("returns 4 for 1 digit (remainder 1)", () => {
      expect(getNumericBitsForDigits(1)).toBe(4);
    });

    it("returns 7 for 2 digits (remainder 2)", () => {
      expect(getNumericBitsForDigits(2)).toBe(7);
    });

    it("returns 10 for 3 digits (one full group)", () => {
      expect(getNumericBitsForDigits(3)).toBe(10);
    });

    it("returns 20 for 6 digits (two full groups)", () => {
      expect(getNumericBitsForDigits(6)).toBe(20);
    });

    it("returns 14 for 4 digits (one group + 1 remainder)", () => {
      expect(getNumericBitsForDigits(4)).toBe(14);
    });
  });

  // ── Pixel mapping ──────────────────────────────────────────────

  describe("pixelToIndex", () => {
    it("returns 0 for (0,0)", () => {
      expect(pixelToIndex(0, 0, 21)).toBe(0);
    });

    it("returns moduleCount for (1,0)", () => {
      expect(pixelToIndex(1, 0, 21)).toBe(21);
    });

    it("computes correct index for arbitrary position", () => {
      expect(pixelToIndex(3, 5, 21)).toBe(3 * 21 + 5);
    });
  });

  describe("indexToPixel", () => {
    it("returns (0,0) for index 0", () => {
      expect(indexToPixel(0, 21)).toEqual({ row: 0, col: 0 });
    });

    it("returns (1,0) for index equal to moduleCount", () => {
      expect(indexToPixel(21, 21)).toEqual({ row: 1, col: 0 });
    });

    it("round-trips with pixelToIndex", () => {
      const idx = pixelToIndex(5, 7, 25);
      expect(indexToPixel(idx, 25)).toEqual({ row: 5, col: 7 });
    });
  });

  // ── Structural module detection ────────────────────────────────

  describe("isFinderPattern", () => {
    it("detects top-left finder area", () => {
      expect(isFinderPattern(0, 0, 21)).toBe(true);
      expect(isFinderPattern(8, 8, 21)).toBe(true);
    });

    it("detects top-right finder area", () => {
      expect(isFinderPattern(0, 20, 21)).toBe(true);
      expect(isFinderPattern(0, 13, 21)).toBe(true);
    });

    it("detects bottom-left finder area", () => {
      expect(isFinderPattern(20, 0, 21)).toBe(true);
      expect(isFinderPattern(13, 0, 21)).toBe(true);
    });

    it("returns false for center", () => {
      expect(isFinderPattern(10, 10, 21)).toBe(false);
    });

    it("returns false for bottom-right corner", () => {
      expect(isFinderPattern(20, 20, 21)).toBe(false);
    });

    it("returns false just outside finder boundary", () => {
      expect(isFinderPattern(9, 9, 21)).toBe(false);
    });
  });

  describe("isTimingPattern", () => {
    it("returns true for row 6", () => {
      expect(isTimingPattern(6, 10)).toBe(true);
    });

    it("returns true for col 6", () => {
      expect(isTimingPattern(10, 6)).toBe(true);
    });

    it("returns false for non-timing position", () => {
      expect(isTimingPattern(5, 10)).toBe(false);
      expect(isTimingPattern(10, 5)).toBe(false);
    });
  });

  describe("isAlignmentPattern", () => {
    it("detects module within alignment pattern center", () => {
      expect(isAlignmentPattern(18, 18, [6, 18])).toBe(true);
    });

    it("returns false for module far from alignment centers", () => {
      expect(isAlignmentPattern(0, 0, [6, 18])).toBe(false);
    });

    it("skips alignment at top-left finder overlap", () => {
      expect(isAlignmentPattern(6, 6, [6, 18])).toBe(false);
    });

    it("returns false with empty alignment positions", () => {
      expect(isAlignmentPattern(10, 10, [])).toBe(false);
    });
  });

  // ── ECC level conversion ───────────────────────────────────────

  describe("eccNumericToLevel", () => {
    it("maps 0 to M", () => {
      expect(eccNumericToLevel(0)).toBe("M");
    });

    it("maps 1 to L", () => {
      expect(eccNumericToLevel(1)).toBe("L");
    });

    it("maps 2 to H", () => {
      expect(eccNumericToLevel(2)).toBe("H");
    });

    it("maps 3 to Q", () => {
      expect(eccNumericToLevel(3)).toBe("Q");
    });

    it("defaults to M for invalid value", () => {
      expect(eccNumericToLevel(99)).toBe("M");
    });
  });

  // ── Suffix validation ──────────────────────────────────────────

  describe("validateSuffixCharacters", () => {
    it("returns valid for all-matching characters", () => {
      const result = validateSuffixCharacters("abc123", () => true);
      expect(result.valid).toBe(true);
    });

    it("returns invalid with details for first non-matching character", () => {
      const result = validateSuffixCharacters("ab!cd", (c) => /[a-z]/.test(c));
      expect(result.valid).toBe(false);
      expect(result.invalidCharIndex).toBe(2);
      expect(result.invalidChar).toBe("!");
    });

    it("strips leading # before validation", () => {
      const result = validateSuffixCharacters("#abc", (c) => /[a-z]/.test(c));
      expect(result.valid).toBe(true);
    });

    it("returns valid for empty string", () => {
      const result = validateSuffixCharacters("", () => false);
      expect(result.valid).toBe(true);
    });

    it("escapes non-printable characters in error", () => {
      const result = validateSuffixCharacters("\x01", () => false);
      expect(result.valid).toBe(false);
      expect(result.invalidChar).toContain("\\x");
    });
  });

  describe("validateSuffixCharset", () => {
    it("accepts alphanumeric characters", () => {
      expect(validateSuffixCharset("Hello123").valid).toBe(true);
    });

    it("accepts special chars: - _ . ~", () => {
      expect(validateSuffixCharset("a-b_c.d~e").valid).toBe(true);
    });

    it("rejects space", () => {
      expect(validateSuffixCharset("hello world").valid).toBe(false);
    });

    it("rejects # character", () => {
      const result = validateSuffixCharset("abc#def");
      expect(result.valid).toBe(false);
    });
  });

  describe("validateNumericSuffix", () => {
    it("accepts all digits", () => {
      expect(validateNumericSuffix("1234567890").valid).toBe(true);
    });

    it("rejects letters", () => {
      const result = validateNumericSuffix("123a456");
      expect(result.valid).toBe(false);
      expect(result.invalidCharIndex).toBe(3);
    });

    it("accepts empty string", () => {
      expect(validateNumericSuffix("").valid).toBe(true);
    });

    it("strips leading # before validation", () => {
      expect(validateNumericSuffix("#12345").valid).toBe(true);
    });
  });

  describe("VALID_SUFFIX_CHARS", () => {
    it("has 66 characters (26+26+10+4)", () => {
      expect(VALID_SUFFIX_CHARS.size).toBe(66);
    });

    it("includes uppercase and lowercase letters", () => {
      expect(VALID_SUFFIX_CHARS.has("A")).toBe(true);
      expect(VALID_SUFFIX_CHARS.has("z")).toBe(true);
    });

    it("does not include # or space", () => {
      expect(VALID_SUFFIX_CHARS.has("#")).toBe(false);
      expect(VALID_SUFFIX_CHARS.has(" ")).toBe(false);
    });
  });

  // ── URL utilities ──────────────────────────────────────────────

  describe("getBaseUrl", () => {
    it("returns URL without hash", () => {
      expect(getBaseUrl("https://example.com#frag")).toBe("https://example.com");
    });

    it("returns full URL when no hash present", () => {
      expect(getBaseUrl("https://example.com/path")).toBe("https://example.com/path");
    });

    it("handles empty fragment", () => {
      expect(getBaseUrl("https://example.com#")).toBe("https://example.com");
    });
  });

  describe("canUseFragmentSearch", () => {
    it("returns true for https URLs", () => {
      expect(canUseFragmentSearch("https://example.com")).toBe(true);
    });

    it("returns true for http URLs", () => {
      expect(canUseFragmentSearch("http://example.com")).toBe(true);
    });

    it("returns false for non-URL content", () => {
      expect(canUseFragmentSearch("Hello World")).toBe(false);
    });

    it("returns false for empty string", () => {
      expect(canUseFragmentSearch("")).toBe(false);
    });

    it("returns false for partial URL", () => {
      expect(canUseFragmentSearch("example.com")).toBe(false);
    });
  });

  describe("analyzeUrlEfficiency", () => {
    it("returns no savings for URL without hash", () => {
      const result = analyzeUrlEfficiency("https://example.com");
      expect(result.savings).toBe(0);
      expect(result.savingsPercent).toBe(0);
      expect(result.byteModeBits).toBe(result.mixedModeBits);
    });

    it("returns savings for URL with long numeric fragment", () => {
      const result = analyzeUrlEfficiency("https://example.com#12345678");
      expect(result.savings).toBeGreaterThan(0);
      expect(result.savingsPercent).toBeGreaterThan(0);
      expect(result.mixedModeBits).toBeLessThan(result.byteModeBits);
    });

    it("returns no savings for non-numeric fragment", () => {
      const result = analyzeUrlEfficiency("https://example.com#abcdef");
      expect(result.savings).toBe(0);
    });

    it("returns no savings for short numeric fragment", () => {
      const result = analyzeUrlEfficiency("https://example.com#123");
      expect(result.savings).toBe(0);
    });
  });

  // ── Buffer pool ────────────────────────────────────────────────

  describe("acquireUint8Buffer", () => {
    it("returns new buffer for requested length", () => {
      const buckets = new Map<number, Uint8Array[]>();
      const buf = acquireUint8Buffer(10, true, buckets, () => {});
      expect(buf).toHaveLength(10);
      expect(buf.every((v) => v === 0)).toBe(true);
    });

    it("reuses buffer from pool", () => {
      const buckets = new Map<number, Uint8Array[]>();
      const existing = new Uint8Array(10).fill(42);
      buckets.set(10, [existing]);
      let acquired = 0;
      const buf = acquireUint8Buffer(10, true, buckets, (bytes) => { acquired = bytes; });
      expect(buf).toBe(existing);
      expect(buf.every((v) => v === 0)).toBe(true);
      expect(acquired).toBe(10);
    });

    it("returns non-cleared buffer from pool when clear=false", () => {
      const buckets = new Map<number, Uint8Array[]>();
      const existing = new Uint8Array(5).fill(99);
      buckets.set(5, [existing]);
      const buf = acquireUint8Buffer(5, false, buckets, () => {});
      expect(buf[0]).toBe(99);
    });

    it("returns empty buffer for length <= 0", () => {
      const buckets = new Map<number, Uint8Array[]>();
      expect(acquireUint8Buffer(0, true, buckets, () => {})).toHaveLength(0);
      expect(acquireUint8Buffer(-1, true, buckets, () => {})).toHaveLength(0);
    });

    it("bypasses pool for very large buffers", () => {
      const buckets = new Map<number, Uint8Array[]>();
      const buf = acquireUint8Buffer(300_000, true, buckets, () => {});
      expect(buf).toHaveLength(300_000);
    });
  });

  // ── LRU cache ──────────────────────────────────────────────────

  describe("updateLruCache", () => {
    it("adds entry to cache", () => {
      const cache = new Map<string, number>();
      updateLruCache(cache, "a", 1, 10);
      expect(cache.get("a")).toBe(1);
    });

    it("evicts oldest when limit exceeded", () => {
      const cache = new Map<string, number>();
      updateLruCache(cache, "a", 1, 2);
      updateLruCache(cache, "b", 2, 2);
      updateLruCache(cache, "c", 3, 2);
      expect(cache.has("a")).toBe(false);
      expect(cache.has("b")).toBe(true);
      expect(cache.has("c")).toBe(true);
    });

    it("promotes existing key on re-set", () => {
      const cache = new Map<string, number>();
      updateLruCache(cache, "a", 1, 2);
      updateLruCache(cache, "b", 2, 2);
      updateLruCache(cache, "a", 10, 2);
      updateLruCache(cache, "c", 3, 2);
      expect(cache.has("a")).toBe(true);
      expect(cache.has("b")).toBe(false);
    });

    it("handles limit of 1", () => {
      const cache = new Map<string, number>();
      updateLruCache(cache, "a", 1, 1);
      updateLruCache(cache, "b", 2, 1);
      expect(cache.size).toBe(1);
      expect(cache.has("b")).toBe(true);
    });
  });

  // ── Basis math ─────────────────────────────────────────────────

  describe("basisToMatrix", () => {
    it("converts single vector to boolean matrix row", () => {
      const vector: RSBasisVector = {
        dataBitIndex: 0,
        rsBlockIndex: 0,
        posInBlock: 0,
        bitInByte: 7,
        blockBits: new Uint8Array([0b10110000]),
        affectedPixels: [0],
        pivotPixel: 0,
      };
      const matrix = basisToMatrix([vector], 8);
      expect(matrix).toHaveLength(1);
      expect(matrix[0]).toEqual([true, false, true, true, false, false, false, false]);
    });

    it("pads to totalBits", () => {
      const vector: RSBasisVector = {
        dataBitIndex: 0,
        rsBlockIndex: 0,
        posInBlock: 0,
        bitInByte: 7,
        blockBits: new Uint8Array([0xff]),
        affectedPixels: [],
        pivotPixel: 0,
      };
      const matrix = basisToMatrix([vector], 16);
      expect(matrix[0]).toHaveLength(16);
      expect(matrix[0].slice(8)).toEqual(Array(8).fill(false));
    });

    it("truncates to totalBits", () => {
      const vector: RSBasisVector = {
        dataBitIndex: 0,
        rsBlockIndex: 0,
        posInBlock: 0,
        bitInByte: 7,
        blockBits: new Uint8Array([0xff, 0xff]),
        affectedPixels: [],
        pivotPixel: 0,
      };
      const matrix = basisToMatrix([vector], 4);
      expect(matrix[0]).toHaveLength(4);
    });
  });

  describe("matrixRowToBytes", () => {
    it("converts all-false row to zero bytes", () => {
      const bytes = matrixRowToBytes(Array(8).fill(false), 1);
      expect(bytes[0]).toBe(0);
    });

    it("converts all-true row to 0xFF", () => {
      const bytes = matrixRowToBytes(Array(8).fill(true), 1);
      expect(bytes[0]).toBe(0xff);
    });

    it("converts mixed row correctly", () => {
      const row = [true, false, true, true, false, false, false, false];
      const bytes = matrixRowToBytes(row, 1);
      expect(bytes[0]).toBe(0b10110000);
    });

    it("handles multi-byte output", () => {
      const row = [
        true, true, true, true, true, true, true, true,
        false, false, false, false, false, false, false, false,
      ];
      const bytes = matrixRowToBytes(row, 2);
      expect(bytes[0]).toBe(0xff);
      expect(bytes[1]).toBe(0x00);
    });
  });

  describe("xorBasisVectors", () => {
    function makeVector(blockBits: number[], blockIdx: number, pixels: number[]): RSBasisVector {
      return {
        dataBitIndex: 0,
        rsBlockIndex: blockIdx,
        posInBlock: 0,
        bitInByte: 0,
        blockBits: new Uint8Array(blockBits),
        affectedPixels: pixels,
        pivotPixel: 0,
      };
    }

    it("XORs block bits", () => {
      const a = makeVector([0b11110000, 0b00001111], 0, [1]);
      const b = makeVector([0b10101010, 0b01010101], 0, [2]);
      const result = xorBasisVectors(a, b);
      expect(result.blockBits[0]).toBe(0b01011010);
      expect(result.blockBits[1]).toBe(0b01011010);
    });

    it("unions affected pixels", () => {
      const a = makeVector([0xff], 0, [1, 2, 3]);
      const b = makeVector([0x00], 0, [3, 4, 5]);
      const result = xorBasisVectors(a, b);
      expect(new Set(result.affectedPixels)).toEqual(new Set([1, 2, 3, 4, 5]));
    });

    it("throws for different block indices", () => {
      const a = makeVector([0xff], 0, []);
      const b = makeVector([0xff], 1, []);
      expect(() => xorBasisVectors(a, b)).toThrow("different RS blocks");
    });

    it("sets combined metadata fields to -1", () => {
      const a = makeVector([0xff], 0, []);
      const b = makeVector([0x00], 0, []);
      const result = xorBasisVectors(a, b);
      expect(result.dataBitIndex).toBe(-1);
      expect(result.posInBlock).toBe(-1);
      expect(result.pivotPixel).toBe(-1);
    });
  });

  // ── Sample points / resolve helpers ────────────────────────────

  describe("buildSamplePoints", () => {
    it("returns 1 point for level 1", () => {
      const points = buildSamplePoints(1);
      expect(points).toHaveLength(1);
      expect(points[0]).toEqual({ dx: 0.5, dy: 0.5 });
    });

    it("returns 9 points for level 3", () => {
      expect(buildSamplePoints(3)).toHaveLength(9);
    });

    it("returns 4 points for default (level 2)", () => {
      expect(buildSamplePoints(2)).toHaveLength(4);
    });

    it("returns 4 points for unknown level", () => {
      expect(buildSamplePoints(99)).toHaveLength(4);
    });
  });

  describe("resolveSupersampleLevel", () => {
    it("defaults to 2", () => {
      expect(resolveSupersampleLevel()).toBe(2);
      expect(resolveSupersampleLevel({})).toBe(2);
    });

    it("returns 1 when explicitly set", () => {
      expect(resolveSupersampleLevel({ supersampleLevel: 1 })).toBe(1);
    });

    it("returns 3 when explicitly set", () => {
      expect(resolveSupersampleLevel({ supersampleLevel: 3 })).toBe(3);
    });
  });

  describe("resolveCleanupArea", () => {
    it("returns number value when provided", () => {
      expect(resolveCleanupArea(10, 5)).toBe(10);
    });

    it("returns fallback for undefined", () => {
      expect(resolveCleanupArea(undefined, 5)).toBe(5);
    });

    it("clamps negative to 0", () => {
      expect(resolveCleanupArea(-3, 5)).toBe(0);
    });

    it("floors fractional values", () => {
      expect(resolveCleanupArea(3.7, 5)).toBe(3);
    });
  });

  describe("shouldRemoveComponent", () => {
    it("returns true for small component", () => {
      expect(shouldRemoveComponent({ cells: [1, 2], touchesBoundary: false }, 5, false)).toBe(true);
    });

    it("returns false for large component", () => {
      expect(
        shouldRemoveComponent({ cells: [1, 2, 3, 4, 5, 6], touchesBoundary: false }, 5, false),
      ).toBe(false);
    });

    it("skips boundary-touching when skipBoundaryTouching is true", () => {
      expect(
        shouldRemoveComponent({ cells: [1], touchesBoundary: true }, 5, true),
      ).toBe(false);
    });

    it("removes boundary-touching when skipBoundaryTouching is false", () => {
      expect(
        shouldRemoveComponent({ cells: [1], touchesBoundary: true }, 5, false),
      ).toBe(true);
    });
  });

  // ── Selection / interleaving ───────────────────────────────────

  describe("unflattenSelections", () => {
    it("returns empty for count 0", () => {
      const flattened = [
        { blockIndex: 0, vectorIndex: 1, importance: 1, pixelIndex: 0 },
      ];
      const result = unflattenSelections(flattened, 0);
      expect(result).toHaveLength(0);
    });

    it("groups selections by block index", () => {
      const flattened = [
        { blockIndex: 0, vectorIndex: 1, importance: 1, pixelIndex: 0 },
        { blockIndex: 1, vectorIndex: 2, importance: 0.9, pixelIndex: 1 },
        { blockIndex: 0, vectorIndex: 3, importance: 0.8, pixelIndex: 2 },
      ];
      const result = unflattenSelections(flattened, 3);
      expect(result).toHaveLength(2);
      const block0 = result.find((r) => r.blockIndex === 0);
      expect(block0?.selectedVectorIndices).toEqual([1, 3]);
    });

    it("limits to count entries", () => {
      const flattened = [
        { blockIndex: 0, vectorIndex: 0, importance: 1, pixelIndex: 0 },
        { blockIndex: 0, vectorIndex: 1, importance: 0.9, pixelIndex: 1 },
        { blockIndex: 0, vectorIndex: 2, importance: 0.8, pixelIndex: 2 },
      ];
      const result = unflattenSelections(flattened, 2);
      const block0 = result.find((r) => r.blockIndex === 0);
      expect(block0?.selectedVectorIndices).toEqual([0, 1]);
    });

    it("sorts results by block index", () => {
      const flattened = [
        { blockIndex: 2, vectorIndex: 0, importance: 1, pixelIndex: 0 },
        { blockIndex: 0, vectorIndex: 1, importance: 0.9, pixelIndex: 1 },
        { blockIndex: 1, vectorIndex: 2, importance: 0.8, pixelIndex: 2 },
      ];
      const result = unflattenSelections(flattened, 3);
      expect(result.map((r) => r.blockIndex)).toEqual([0, 1, 2]);
    });
  });

  describe("simulateInterleavingProtection", () => {
    it("returns all -1 for zero protected bytes", () => {
      const blocks: RSBlockInfo[] = [
        { blockIndex: 0, dataCount: 10, eccCount: 5, totalCount: 15 },
        { blockIndex: 1, dataCount: 10, eccCount: 5, totalCount: 15 },
      ];
      const result = simulateInterleavingProtection(blocks, 2, 0);
      expect(result).toEqual([-1, -1]);
    });

    it("distributes protection across blocks with interleaving", () => {
      const blocks: RSBlockInfo[] = [
        { blockIndex: 0, dataCount: 5, eccCount: 3, totalCount: 8 },
        { blockIndex: 1, dataCount: 5, eccCount: 3, totalCount: 8 },
      ];
      const result = simulateInterleavingProtection(blocks, 2, 4);
      expect(result[0]).toBeGreaterThanOrEqual(0);
      expect(result[1]).toBeGreaterThanOrEqual(0);
    });

    it("handles single block", () => {
      const blocks: RSBlockInfo[] = [
        { blockIndex: 0, dataCount: 10, eccCount: 5, totalCount: 15 },
      ];
      const result = simulateInterleavingProtection(blocks, 1, 5);
      expect(result).toEqual([4]);
    });
  });

  // ── Constants ──────────────────────────────────────────────────

  describe("constants", () => {
    it("MIN_QART_VERSION is 1", () => {
      expect(MIN_QART_VERSION).toBe(1);
    });

    it("MIN_ECC_HEADROOM_BYTES is 2", () => {
      expect(MIN_ECC_HEADROOM_BYTES).toBe(2);
    });
  });
});
