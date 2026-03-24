import { describe, it, expect } from "vitest";
import { getBCHDigit } from "./get-bch-digit";
import { getBCHTypeInfo } from "./get-bch-type-info";
import { getBCHTypeNumber } from "./get-bch-type-number";
import { G15, G15_MASK, G18 } from "./g15";
import { getModuleCountForVersion } from "./get-module-count-for-version";
import { getVersionFromModuleCount } from "./get-version-from-module-count";
import { getAlignmentPositions } from "./get-alignment-positions";
import { ALIGNMENT_POSITIONS } from "./alignment-positions";
import { getAlignmentPatternCenters } from "./get-alignment-pattern-centers";
import { alignmentOverlapsFinderRegion } from "./alignment-overlaps-finder-region";
import { isFinderPattern } from "./is-finder-pattern";
import { isTimingPattern } from "./is-timing-pattern";
import { isAlignmentPattern } from "./is-alignment-pattern";
import { isFormatInfo } from "./is-format-info";
import { isVersionInfo } from "./is-version-info";
import { isQuietZoneSeparator } from "./is-quiet-zone-separator";
import { isStructuralModule } from "./is-structural-module";
import { isData } from "./is-data";
import { isLocked } from "./is-locked";
import { getMaskFunction } from "./masks";
import { getEccWeight } from "./get-ecc-weight";
import { QRMaskPattern } from "./qr-mask-pattern";
import { ECC_CAPACITIES_BYTE } from "./ecc-capacities-byte";
import { ECC_CAPACITIES_NUMERIC } from "./ecc-capacities-numeric";
import { ECC_CAPACITIES_ALPHANUMERIC } from "./ecc-capacities-alphanumeric";
import { hashString } from "../qr-generator/hash-string";
import { clampN } from "../qr-generator/clamp-n";
import { darkenColor } from "../qr-generator/darken-color";
import { lightenColor } from "../qr-generator/lighten-color";

describe("domain/qr/spec", () => {
  describe("constants", () => {
    it("G15 is the BCH generator polynomial for format info", () => {
      expect(G15).toBe(0x537);
    });

    it("G15_MASK is the XOR mask for format info", () => {
      expect(G15_MASK).toBe(0x5412);
    });

    it("G18 is the BCH generator polynomial for version info", () => {
      expect(G18).toBe(0x1f25);
    });

    it("QRMaskPattern has 8 patterns (0-7)", () => {
      expect(QRMaskPattern.PATTERN000).toBe(0);
      expect(QRMaskPattern.PATTERN001).toBe(1);
      expect(QRMaskPattern.PATTERN010).toBe(2);
      expect(QRMaskPattern.PATTERN011).toBe(3);
      expect(QRMaskPattern.PATTERN100).toBe(4);
      expect(QRMaskPattern.PATTERN101).toBe(5);
      expect(QRMaskPattern.PATTERN110).toBe(6);
      expect(QRMaskPattern.PATTERN111).toBe(7);
    });
  });

  describe("getBCHDigit", () => {
    it("returns 0 for input 0", () => {
      expect(getBCHDigit(0)).toBe(0);
    });

    it("returns 1 for input 1", () => {
      expect(getBCHDigit(1)).toBe(1);
    });

    it("returns the number of bits needed to represent a value", () => {
      expect(getBCHDigit(2)).toBe(2);
      expect(getBCHDigit(3)).toBe(2);
      expect(getBCHDigit(4)).toBe(3);
      expect(getBCHDigit(255)).toBe(8);
      expect(getBCHDigit(256)).toBe(9);
    });

    it("handles powers of 2", () => {
      expect(getBCHDigit(1)).toBe(1);
      expect(getBCHDigit(2)).toBe(2);
      expect(getBCHDigit(4)).toBe(3);
      expect(getBCHDigit(8)).toBe(4);
      expect(getBCHDigit(16)).toBe(5);
    });
  });

  describe("getBCHTypeInfo", () => {
    it("returns a 15-bit value (after XOR with mask)", () => {
      for (let data = 0; data < 32; data++) {
        const result = getBCHTypeInfo(data);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThan(1 << 15);
      }
    });

    it("is deterministic", () => {
      expect(getBCHTypeInfo(0)).toBe(getBCHTypeInfo(0));
      expect(getBCHTypeInfo(7)).toBe(getBCHTypeInfo(7));
    });

    it("produces different outputs for different inputs", () => {
      const results = new Set<number>();
      for (let data = 0; data < 32; data++) {
        results.add(getBCHTypeInfo(data));
      }
      expect(results.size).toBe(32);
    });
  });

  describe("getBCHTypeNumber", () => {
    it("returns an 18-bit value", () => {
      for (let version = 7; version <= 40; version++) {
        const result = getBCHTypeNumber(version);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThan(1 << 18);
      }
    });

    it("encodes the version in the upper 6 bits", () => {
      for (let version = 7; version <= 40; version++) {
        const result = getBCHTypeNumber(version);
        expect(result >> 12).toBe(version);
      }
    });

    it("is deterministic", () => {
      expect(getBCHTypeNumber(7)).toBe(getBCHTypeNumber(7));
      expect(getBCHTypeNumber(40)).toBe(getBCHTypeNumber(40));
    });
  });

  describe("getModuleCountForVersion / getVersionFromModuleCount", () => {
    it("version 1 has 21 modules", () => {
      expect(getModuleCountForVersion(1)).toBe(21);
    });

    it("version 40 has 177 modules", () => {
      expect(getModuleCountForVersion(40)).toBe(177);
    });

    it("formula is version * 4 + 17", () => {
      for (let v = 1; v <= 40; v++) {
        expect(getModuleCountForVersion(v)).toBe(v * 4 + 17);
      }
    });

    it("round-trips for all versions", () => {
      for (let v = 1; v <= 40; v++) {
        const mc = getModuleCountForVersion(v);
        expect(getVersionFromModuleCount(mc)).toBe(v);
      }
    });
  });

  describe("ALIGNMENT_POSITIONS", () => {
    it("has 40 entries (one per version)", () => {
      expect(ALIGNMENT_POSITIONS).toHaveLength(40);
    });

    it("version 1 has no alignment patterns", () => {
      expect(ALIGNMENT_POSITIONS[0]).toEqual([]);
    });

    it("version 2 has positions [6, 18]", () => {
      expect(ALIGNMENT_POSITIONS[1]).toEqual([6, 18]);
    });

    it("all positions start with 6", () => {
      for (let i = 1; i < 40; i++) {
        expect(ALIGNMENT_POSITIONS[i][0]).toBe(6);
      }
    });

    it("positions are sorted ascending within each version", () => {
      for (const positions of ALIGNMENT_POSITIONS) {
        for (let i = 1; i < positions.length; i++) {
          expect(positions[i]).toBeGreaterThan(positions[i - 1]);
        }
      }
    });
  });

  describe("getAlignmentPositions", () => {
    it("returns empty array for version 0 and below", () => {
      expect(getAlignmentPositions(0)).toEqual([]);
      expect(getAlignmentPositions(-1)).toEqual([]);
    });

    it("returns empty array for version 1", () => {
      expect(getAlignmentPositions(1)).toEqual([]);
    });

    it("returns [6, 18] for version 2", () => {
      expect(getAlignmentPositions(2)).toEqual([6, 18]);
    });

    it("returns empty array for versions above 40", () => {
      expect(getAlignmentPositions(41)).toEqual([]);
    });
  });

  describe("alignmentOverlapsFinderRegion", () => {
    const mc = 25; // version 2

    it("returns true for positions inside a finder pattern", () => {
      expect(alignmentOverlapsFinderRegion(3, 3, mc)).toBe(true);
    });

    it("returns true for positions whose 5x5 region overlaps a finder", () => {
      expect(alignmentOverlapsFinderRegion(6, 6, mc)).toBe(true);
      expect(alignmentOverlapsFinderRegion(6, mc - 6, mc)).toBe(true);
      expect(alignmentOverlapsFinderRegion(mc - 6, 6, mc)).toBe(true);
    });

    it("returns false for positions far from finders", () => {
      expect(alignmentOverlapsFinderRegion(18, 18, mc)).toBe(false);
    });
  });

  describe("getAlignmentPatternCenters", () => {
    it("returns empty for version 1", () => {
      expect(getAlignmentPatternCenters(1, 21)).toEqual([]);
    });

    it("returns one center for version 2 (excluding finder overlaps)", () => {
      const centers = getAlignmentPatternCenters(2, 25);
      expect(centers.length).toBeGreaterThanOrEqual(1);
      expect(centers).toContainEqual({ row: 18, col: 18 });
    });

    it("returns centers that do not overlap finder regions", () => {
      const mc = getModuleCountForVersion(7);
      const centers = getAlignmentPatternCenters(7, mc);
      for (const center of centers) {
        expect(alignmentOverlapsFinderRegion(center.row, center.col, mc)).toBe(false);
      }
    });
  });

  describe("isFinderPattern", () => {
    const mc = 21; // version 1

    it("identifies top-left finder (0,0) to (6,6)", () => {
      expect(isFinderPattern(0, 0, mc)).toBe(true);
      expect(isFinderPattern(6, 6, mc)).toBe(true);
      expect(isFinderPattern(3, 3, mc)).toBe(true);
    });

    it("identifies top-right finder", () => {
      expect(isFinderPattern(0, mc - 1, mc)).toBe(true);
      expect(isFinderPattern(0, mc - 7, mc)).toBe(true);
      expect(isFinderPattern(6, mc - 1, mc)).toBe(true);
    });

    it("identifies bottom-left finder", () => {
      expect(isFinderPattern(mc - 1, 0, mc)).toBe(true);
      expect(isFinderPattern(mc - 7, 0, mc)).toBe(true);
      expect(isFinderPattern(mc - 1, 6, mc)).toBe(true);
    });

    it("returns false for non-finder positions", () => {
      expect(isFinderPattern(7, 0, mc)).toBe(false);
      expect(isFinderPattern(0, 7, mc)).toBe(false);
      expect(isFinderPattern(10, 10, mc)).toBe(false);
    });
  });

  describe("isTimingPattern", () => {
    const mc = 21;

    it("identifies horizontal timing (row 6, between finders)", () => {
      expect(isTimingPattern(6, 8, mc)).toBe(true);
      expect(isTimingPattern(6, 10, mc)).toBe(true);
      expect(isTimingPattern(6, mc - 9, mc)).toBe(true);
    });

    it("identifies vertical timing (col 6, between finders)", () => {
      expect(isTimingPattern(8, 6, mc)).toBe(true);
      expect(isTimingPattern(10, 6, mc)).toBe(true);
      expect(isTimingPattern(mc - 9, 6, mc)).toBe(true);
    });

    it("returns false inside finder region", () => {
      expect(isTimingPattern(6, 3, mc)).toBe(false);
      expect(isTimingPattern(3, 6, mc)).toBe(false);
    });

    it("returns false for non-timing positions", () => {
      expect(isTimingPattern(5, 8, mc)).toBe(false);
      expect(isTimingPattern(10, 10, mc)).toBe(false);
    });
  });

  describe("isAlignmentPattern", () => {
    it("returns false for version 1 (no alignment patterns)", () => {
      expect(isAlignmentPattern(10, 10, 21, 1)).toBe(false);
    });

    it("identifies alignment pattern for version 2 at center (18,18)", () => {
      expect(isAlignmentPattern(18, 18, 25, 2)).toBe(true);
      expect(isAlignmentPattern(16, 16, 25, 2)).toBe(true);
      expect(isAlignmentPattern(20, 20, 25, 2)).toBe(true);
    });

    it("returns false outside alignment pattern region", () => {
      expect(isAlignmentPattern(15, 15, 25, 2)).toBe(false);
      expect(isAlignmentPattern(10, 10, 25, 2)).toBe(false);
    });
  });

  describe("isFormatInfo", () => {
    const mc = 21;

    it("identifies format info around top-left finder", () => {
      expect(isFormatInfo(8, 0, mc)).toBe(true);
      expect(isFormatInfo(8, 5, mc)).toBe(true);
      expect(isFormatInfo(8, 7, mc)).toBe(true);
      expect(isFormatInfo(8, 8, mc)).toBe(true);
      expect(isFormatInfo(0, 8, mc)).toBe(true);
      expect(isFormatInfo(5, 8, mc)).toBe(true);
      expect(isFormatInfo(7, 8, mc)).toBe(true);
    });

    it("identifies format info near top-right finder", () => {
      expect(isFormatInfo(8, mc - 1, mc)).toBe(true);
      expect(isFormatInfo(8, mc - 8, mc)).toBe(true);
    });

    it("identifies format info near bottom-left finder", () => {
      expect(isFormatInfo(mc - 1, 8, mc)).toBe(true);
      expect(isFormatInfo(mc - 7, 8, mc)).toBe(true);
    });

    it("returns false for non-format-info positions", () => {
      expect(isFormatInfo(10, 10, mc)).toBe(false);
      expect(isFormatInfo(9, 0, mc)).toBe(false);
    });
  });

  describe("isVersionInfo", () => {
    it("returns false for versions below 7", () => {
      expect(isVersionInfo(0, 0, 21, 1)).toBe(false);
      expect(isVersionInfo(0, 0, 41, 6)).toBe(false);
    });

    it("identifies bottom-left of top-right finder area for version 7", () => {
      const mc = getModuleCountForVersion(7);
      expect(isVersionInfo(0, mc - 11, mc, 7)).toBe(true);
      expect(isVersionInfo(5, mc - 9, mc, 7)).toBe(true);
    });

    it("identifies right of bottom-left finder area for version 7", () => {
      const mc = getModuleCountForVersion(7);
      expect(isVersionInfo(mc - 11, 0, mc, 7)).toBe(true);
      expect(isVersionInfo(mc - 9, 5, mc, 7)).toBe(true);
    });

    it("returns false for positions outside version info area", () => {
      const mc = getModuleCountForVersion(7);
      expect(isVersionInfo(10, 10, mc, 7)).toBe(false);
    });
  });

  describe("isQuietZoneSeparator", () => {
    const mc = 21;

    it("identifies top-left separator", () => {
      expect(isQuietZoneSeparator(7, 0, mc)).toBe(true);
      expect(isQuietZoneSeparator(7, 7, mc)).toBe(true);
      expect(isQuietZoneSeparator(0, 7, mc)).toBe(true);
    });

    it("identifies top-right separator", () => {
      expect(isQuietZoneSeparator(7, mc - 8, mc)).toBe(true);
      expect(isQuietZoneSeparator(7, mc - 1, mc)).toBe(true);
      expect(isQuietZoneSeparator(0, mc - 8, mc)).toBe(true);
    });

    it("identifies bottom-left separator", () => {
      expect(isQuietZoneSeparator(mc - 8, 0, mc)).toBe(true);
      expect(isQuietZoneSeparator(mc - 8, 7, mc)).toBe(true);
      expect(isQuietZoneSeparator(mc - 1, 7, mc)).toBe(true);
    });

    it("returns false for non-separator positions", () => {
      expect(isQuietZoneSeparator(10, 10, mc)).toBe(false);
      expect(isQuietZoneSeparator(8, 8, mc)).toBe(false);
    });
  });

  describe("isStructuralModule", () => {
    const mc = 21;
    const version = 1;

    it("returns true for finder pattern modules", () => {
      expect(isStructuralModule(0, 0, mc, version)).toBe(true);
    });

    it("returns true for timing pattern modules", () => {
      expect(isStructuralModule(6, 8, mc, version)).toBe(true);
    });

    it("returns true for format info modules", () => {
      expect(isStructuralModule(8, 0, mc, version)).toBe(true);
    });

    it("returns true for quiet zone separators", () => {
      expect(isStructuralModule(7, 0, mc, version)).toBe(true);
    });

    it("returns true for the dark module at (moduleCount-8, 8)", () => {
      expect(isStructuralModule(mc - 8, 8, mc, version)).toBe(true);
    });

    it("returns false for data modules", () => {
      expect(isStructuralModule(10, 10, mc, version)).toBe(false);
    });
  });

  describe("isData / isLocked", () => {
    const mc = 21;
    const version = 1;

    it("isData returns true for non-structural positions", () => {
      expect(isData(10, 10, mc, version)).toBe(true);
    });

    it("isData returns false for structural positions", () => {
      expect(isData(0, 0, mc, version)).toBe(false);
    });

    it("isLocked is the inverse of isData", () => {
      for (let r = 0; r < mc; r += 5) {
        for (let c = 0; c < mc; c += 5) {
          expect(isData(r, c, mc, version)).toBe(!isLocked(r, c, mc, version));
        }
      }
    });
  });

  describe("getMaskFunction", () => {
    it("pattern 0: (i + j) mod 2 == 0", () => {
      const fn = getMaskFunction(0);
      expect(fn(0, 0)).toBe(true);
      expect(fn(0, 1)).toBe(false);
      expect(fn(1, 0)).toBe(false);
      expect(fn(1, 1)).toBe(true);
    });

    it("pattern 1: i mod 2 == 0", () => {
      const fn = getMaskFunction(1);
      expect(fn(0, 0)).toBe(true);
      expect(fn(0, 5)).toBe(true);
      expect(fn(1, 0)).toBe(false);
      expect(fn(1, 5)).toBe(false);
      expect(fn(2, 0)).toBe(true);
    });

    it("pattern 2: j mod 3 == 0", () => {
      const fn = getMaskFunction(2);
      expect(fn(0, 0)).toBe(true);
      expect(fn(0, 1)).toBe(false);
      expect(fn(0, 2)).toBe(false);
      expect(fn(0, 3)).toBe(true);
      expect(fn(5, 6)).toBe(true);
    });

    it("pattern 3: (i + j) mod 3 == 0", () => {
      const fn = getMaskFunction(3);
      expect(fn(0, 0)).toBe(true);
      expect(fn(0, 1)).toBe(false);
      expect(fn(0, 3)).toBe(true);
      expect(fn(1, 2)).toBe(true);
      expect(fn(2, 1)).toBe(true);
    });

    it("pattern 4: (floor(i/2) + floor(j/3)) mod 2 == 0", () => {
      const fn = getMaskFunction(4);
      expect(fn(0, 0)).toBe(true);
      expect(fn(0, 3)).toBe(false);
      expect(fn(2, 0)).toBe(false);
      expect(fn(2, 3)).toBe(true);
    });

    it("pattern 5: (i*j) mod 2 + (i*j) mod 3 == 0", () => {
      const fn = getMaskFunction(5);
      expect(fn(0, 0)).toBe(true);
      expect(fn(0, 1)).toBe(true);
      expect(fn(1, 0)).toBe(true);
      expect(fn(1, 1)).toBe(false);
      expect(fn(2, 3)).toBe(true);
    });

    it("pattern 6: ((i*j) mod 2 + (i*j) mod 3) mod 2 == 0", () => {
      const fn = getMaskFunction(6);
      expect(fn(0, 0)).toBe(true);
      expect(fn(0, 1)).toBe(true);
      expect(fn(1, 0)).toBe(true);
      expect(fn(1, 1)).toBe(true);
      expect(fn(1, 3)).toBe(false);
    });

    it("pattern 7: ((i*j) mod 3 + (i+j) mod 2) mod 2 == 0", () => {
      const fn = getMaskFunction(7);
      expect(fn(0, 0)).toBe(true);
      expect(fn(0, 1)).toBe(false);
      expect(fn(1, 0)).toBe(false);
      expect(fn(0, 2)).toBe(true);
      expect(fn(2, 4)).toBe(true);
    });

    it("throws for invalid mask pattern", () => {
      expect(() => getMaskFunction(-1)).toThrow("Invalid mask pattern");
      expect(() => getMaskFunction(8)).toThrow("Invalid mask pattern");
    });

    it("accepts QRMaskPattern enum values", () => {
      const fn = getMaskFunction(QRMaskPattern.PATTERN000);
      expect(fn(0, 0)).toBe(true);
      const fn7 = getMaskFunction(QRMaskPattern.PATTERN111);
      expect(fn7(0, 0)).toBe(true);
    });
  });

  describe("getEccWeight", () => {
    const mc = 21;

    it("distance_to_finders: corner near finder has high weight", () => {
      const weight = getEccWeight(0, 0, mc, 1, "distance_to_finders");
      expect(weight).toBeCloseTo(1, 1);
    });

    it("distance_to_finders: center has lower weight", () => {
      const center = getEccWeight(10, 10, mc, 1, "distance_to_finders");
      const corner = getEccWeight(0, 0, mc, 1, "distance_to_finders");
      expect(center).toBeLessThan(corner);
    });

    it("block_heatmap: center has low weight, edge has high weight", () => {
      const center = getEccWeight(10, 10, mc, 1, "block_heatmap");
      const edge = getEccWeight(0, 0, mc, 1, "block_heatmap");
      expect(center).toBeLessThan(edge);
    });

    it("empirical_scan_heatmap: top-left has higher weight", () => {
      const topLeft = getEccWeight(0, 0, mc, 1, "empirical_scan_heatmap");
      const bottomRight = getEccWeight(mc - 1, mc - 1, mc, 1, "empirical_scan_heatmap");
      expect(topLeft).toBeGreaterThan(bottomRight);
    });

    it("default returns 0.5 for unknown weight map", () => {
      expect(getEccWeight(5, 5, mc, 1, "unknown")).toBe(0.5);
    });

    it("all weight maps return finite numbers", () => {
      const maps = ["distance_to_finders", "block_heatmap", "empirical_scan_heatmap"];
      for (const map of maps) {
        for (let r = 0; r < mc; r += 5) {
          for (let c = 0; c < mc; c += 5) {
            const w = getEccWeight(r, c, mc, 1, map);
            expect(Number.isFinite(w)).toBe(true);
          }
        }
      }
    });
  });

  describe("ECC capacity tables", () => {
    const levels: Array<"L" | "M" | "Q" | "H"> = ["L", "M", "Q", "H"];

    it("byte capacities have 40 entries per ECC level", () => {
      for (const level of levels) {
        expect(ECC_CAPACITIES_BYTE[level]).toHaveLength(40);
      }
    });

    it("numeric capacities have 40 entries per ECC level", () => {
      for (const level of levels) {
        expect(ECC_CAPACITIES_NUMERIC[level]).toHaveLength(40);
      }
    });

    it("alphanumeric capacities have 40 entries per ECC level", () => {
      for (const level of levels) {
        expect(ECC_CAPACITIES_ALPHANUMERIC[level]).toHaveLength(40);
      }
    });

    it("capacities increase with version for each ECC level", () => {
      for (const level of levels) {
        for (let i = 1; i < 40; i++) {
          expect(ECC_CAPACITIES_BYTE[level][i]).toBeGreaterThanOrEqual(
            ECC_CAPACITIES_BYTE[level][i - 1],
          );
        }
      }
    });

    it("L has the most capacity, H has the least (for same version)", () => {
      for (let i = 0; i < 40; i++) {
        expect(ECC_CAPACITIES_BYTE["L"][i]).toBeGreaterThanOrEqual(ECC_CAPACITIES_BYTE["M"][i]);
        expect(ECC_CAPACITIES_BYTE["M"][i]).toBeGreaterThanOrEqual(ECC_CAPACITIES_BYTE["Q"][i]);
        expect(ECC_CAPACITIES_BYTE["Q"][i]).toBeGreaterThanOrEqual(ECC_CAPACITIES_BYTE["H"][i]);
      }
    });

    it("numeric capacity > alphanumeric > byte for same version and level", () => {
      for (const level of levels) {
        for (let i = 0; i < 40; i++) {
          expect(ECC_CAPACITIES_NUMERIC[level][i]).toBeGreaterThan(
            ECC_CAPACITIES_ALPHANUMERIC[level][i],
          );
          expect(ECC_CAPACITIES_ALPHANUMERIC[level][i]).toBeGreaterThan(
            ECC_CAPACITIES_BYTE[level][i],
          );
        }
      }
    });

    it("version 1 L byte capacity is 17", () => {
      expect(ECC_CAPACITIES_BYTE["L"][0]).toBe(17);
    });

    it("version 40 L numeric capacity is 7089", () => {
      expect(ECC_CAPACITIES_NUMERIC["L"][39]).toBe(7089);
    });
  });
});

describe("domain/qr/generator utilities", () => {
  describe("hashString (djb2)", () => {
    it("returns 5381 for empty string", () => {
      expect(hashString("")).toBe(5381);
    });

    it("is deterministic", () => {
      expect(hashString("hello")).toBe(hashString("hello"));
      expect(hashString("anqr")).toBe(hashString("anqr"));
    });

    it("produces different hashes for different strings", () => {
      const hashes = new Set(["a", "b", "ab", "ba", "hello", "world"].map(hashString));
      expect(hashes.size).toBe(6);
    });

    it("returns an unsigned 32-bit integer", () => {
      const hash = hashString("test string with some length");
      expect(hash).toBeGreaterThanOrEqual(0);
      expect(hash).toBeLessThanOrEqual(0xffffffff);
    });
  });

  describe("clampN", () => {
    it("returns value when within range", () => {
      expect(clampN(5, 0, 10)).toBe(5);
      expect(clampN(0, 0, 10)).toBe(0);
      expect(clampN(10, 0, 10)).toBe(10);
    });

    it("clamps to lower bound", () => {
      expect(clampN(-1, 0, 10)).toBe(0);
      expect(clampN(-100, 0, 10)).toBe(0);
    });

    it("clamps to upper bound", () => {
      expect(clampN(11, 0, 10)).toBe(10);
      expect(clampN(1000, 0, 10)).toBe(10);
    });

    it("works with negative ranges", () => {
      expect(clampN(0, -10, -5)).toBe(-5);
      expect(clampN(-20, -10, -5)).toBe(-10);
      expect(clampN(-7, -10, -5)).toBe(-7);
    });

    it("works with fractional values", () => {
      expect(clampN(0.5, 0, 1)).toBe(0.5);
      expect(clampN(1.5, 0, 1)).toBe(1);
    });
  });

  describe("darkenColor", () => {
    it("factor 0 leaves color unchanged", () => {
      expect(darkenColor("ffffff", 0)).toBe("rgb(255,255,255)");
    });

    it("factor 1 produces black", () => {
      expect(darkenColor("ffffff", 1)).toBe("rgb(0,0,0)");
    });

    it("factor 0.5 halves the RGB values", () => {
      expect(darkenColor("ff8040", 0.5)).toBe("rgb(128,64,32)");
    });

    it("handles # prefix", () => {
      expect(darkenColor("#ffffff", 0)).toBe("rgb(255,255,255)");
    });

    it("black stays black at any factor", () => {
      expect(darkenColor("000000", 0.5)).toBe("rgb(0,0,0)");
    });
  });

  describe("lightenColor", () => {
    it("factor 0 leaves color unchanged", () => {
      expect(lightenColor("000000", 0)).toBe("rgb(0,0,0)");
    });

    it("factor 1 produces white from black", () => {
      expect(lightenColor("000000", 1)).toBe("rgb(255,255,255)");
    });

    it("factor 0.5 moves halfway to white", () => {
      expect(lightenColor("000000", 0.5)).toBe("rgb(128,128,128)");
    });

    it("handles # prefix", () => {
      expect(lightenColor("#000000", 1)).toBe("rgb(255,255,255)");
    });

    it("white stays white at any factor", () => {
      expect(lightenColor("ffffff", 0.5)).toBe("rgb(255,255,255)");
    });
  });
});
