import { describe, it, expect, beforeEach } from "vitest";
import { formatMilliseconds } from "./format-milliseconds";
import { analyzePlatformRuntimeState } from "./analyze-platform-runtime-state";
import { configureAnalyzePlatformRuntime } from "./configure-analyze-platform-runtime";
import { getAnalyzePlatformRuntime } from "./get-analyze-platform-runtime";
import type { AnalyzePlatformRuntime } from "./analyze-platform-runtime.types";
import { capacityBadgeClass } from "./capacity-badge-class";
import { wcagComplianceClass } from "./wcag-compliance-class";
import { countShiftedDiffs } from "./count-shifted-diffs";
import { computeMarginModules } from "./compute-margin-modules";
import { hasAnyTimingData } from "./has-any-timing-data";
import { nowMs } from "./now-ms";
import { waitMs } from "./wait-ms";
import { resolveMode } from "./resolve-mode";
import { resolveEffectiveMode } from "./resolve-effective-mode";
import { buildCandidateFrameIndices } from "./build-candidate-frame-indices";
import { diffMatrices } from "./diff-matrices";
import { findBestMatrixShift } from "./find-best-matrix-shift";
import { buildMaskPatternOption } from "./build-mask-pattern-option";
import { resolveFinalVersion } from "./resolve-final-version";
import { buildEncoderInput } from "./build-encoder-input";
import { computeCanvasSizing } from "./compute-canvas-sizing";
import { resolveColors } from "./resolve-reproduction-colors";

describe("application/analyze", () => {
  describe("formatMilliseconds", () => {
    it("formats a number to 2 decimal places with ms suffix", () => {
      expect(formatMilliseconds(123.456)).toBe("123.46 ms");
    });

    it("formats zero", () => {
      expect(formatMilliseconds(0)).toBe("0.00 ms");
    });

    it("returns N/A for null", () => {
      expect(formatMilliseconds(null)).toBe("N/A");
    });

    it("returns N/A for undefined", () => {
      expect(formatMilliseconds(undefined)).toBe("N/A");
    });

    it("returns N/A for NaN", () => {
      expect(formatMilliseconds(NaN)).toBe("N/A");
    });
  });

  describe("capacityBadgeClass", () => {
    it("returns red class for percentage > 90", () => {
      expect(capacityBadgeClass(95)).toContain("red");
    });

    it("returns amber class for percentage > 70", () => {
      expect(capacityBadgeClass(75)).toContain("amber");
    });

    it("returns green class for percentage <= 70", () => {
      expect(capacityBadgeClass(50)).toContain("green");
    });

    it("returns amber at boundary 71", () => {
      expect(capacityBadgeClass(71)).toContain("amber");
    });

    it("returns green at boundary 70", () => {
      expect(capacityBadgeClass(70)).toContain("green");
    });

    it("returns red at boundary 91", () => {
      expect(capacityBadgeClass(91)).toContain("red");
    });
  });

  describe("wcagComplianceClass", () => {
    it("returns green class when ratio meets threshold", () => {
      expect(wcagComplianceClass(4.5, 4.5)).toContain("green");
    });

    it("returns green class when ratio exceeds threshold", () => {
      expect(wcagComplianceClass(7.0, 4.5)).toContain("green");
    });

    it("returns red class when ratio is below threshold", () => {
      expect(wcagComplianceClass(3.0, 4.5)).toContain("red");
    });
  });

  describe("countShiftedDiffs", () => {
    const matrix3x3True: boolean[][] = [
      [true, true, true],
      [true, true, true],
      [true, true, true],
    ];
    const matrix3x3False: boolean[][] = [
      [false, false, false],
      [false, false, false],
      [false, false, false],
    ];

    it("returns 0 for identical matrices with no shift", () => {
      expect(countShiftedDiffs(matrix3x3True, matrix3x3True, 3, 0, 0)).toBe(0);
    });

    it("counts all modules as different for opposite matrices", () => {
      expect(countShiftedDiffs(matrix3x3True, matrix3x3False, 3, 0, 0)).toBe(9);
    });

    it("adds moduleCount for each out-of-range row", () => {
      const result = countShiftedDiffs(matrix3x3True, matrix3x3True, 3, 2, 0);
      expect(result).toBeGreaterThan(0);
    });

    it("adds 1 for each out-of-range column", () => {
      const result = countShiftedDiffs(matrix3x3True, matrix3x3True, 3, 0, 2);
      expect(result).toBeGreaterThan(0);
    });

    it("handles negative shifts", () => {
      const result = countShiftedDiffs(matrix3x3True, matrix3x3True, 3, -1, -1);
      expect(result).toBeGreaterThan(0);
    });
  });

  describe("computeMarginModules", () => {
    it("computes from generator canvas when isGeneratorSource", () => {
      const canvas = { width: 400 } as HTMLCanvasElement;
      const result = computeMarginModules(true, canvas, 25, 10, undefined);
      expect(result).toBeGreaterThanOrEqual(0);
    });

    it("returns at least 4 for non-generator source", () => {
      expect(computeMarginModules(false, null, 25, 10, undefined)).toBe(4);
    });

    it("uses quietZoneTop when not generator source", () => {
      expect(computeMarginModules(false, null, 25, 10, 8)).toBe(8);
    });

    it("clamps to minimum 4 for non-generator source", () => {
      expect(computeMarginModules(false, null, 25, 10, 2)).toBe(4);
    });

    it("returns 0+ when generator canvas produces small margin", () => {
      const canvas = { width: 25 } as HTMLCanvasElement;
      const result = computeMarginModules(true, canvas, 25, 1, undefined);
      expect(result).toBeGreaterThanOrEqual(0);
    });
  });

  describe("hasAnyTimingData", () => {
    it("returns true when decodeMs is present", () => {
      expect(
        hasAnyTimingData({
          decodeMs: 10,
          totalAnalysisMs: null,
          encodeMs: null,
          renderMs: null,
          exportMs: null,
        }),
      ).toBe(true);
    });

    it("returns false when all timings are null", () => {
      expect(
        hasAnyTimingData({
          decodeMs: null,
          totalAnalysisMs: null,
          encodeMs: null,
          renderMs: null,
          exportMs: null,
        }),
      ).toBe(false);
    });

    it("returns false when all timings are undefined", () => {
      expect(
        hasAnyTimingData({
          decodeMs: undefined,
          totalAnalysisMs: undefined,
          encodeMs: undefined,
          renderMs: undefined,
          exportMs: undefined,
        }),
      ).toBe(false);
    });

    it("returns true when only exportMs is present", () => {
      expect(
        hasAnyTimingData({
          decodeMs: null,
          totalAnalysisMs: null,
          encodeMs: null,
          renderMs: null,
          exportMs: 5,
        }),
      ).toBe(true);
    });

    it("treats 0 as present", () => {
      expect(
        hasAnyTimingData({
          decodeMs: 0,
          totalAnalysisMs: null,
          encodeMs: null,
          renderMs: null,
          exportMs: null,
        }),
      ).toBe(true);
    });
  });

  describe("nowMs", () => {
    it("returns a finite number", () => {
      expect(Number.isFinite(nowMs())).toBe(true);
    });

    it("returns a non-negative value", () => {
      expect(nowMs()).toBeGreaterThanOrEqual(0);
    });
  });

  describe("waitMs", () => {
    it("resolves after the specified delay", async () => {
      const start = Date.now();
      await waitMs(10);
      expect(Date.now() - start).toBeGreaterThanOrEqual(5);
    });

    it("returns a promise", () => {
      const result = waitMs(0);
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe("resolveMode", () => {
    const makeResult = (encodingMode: string | null) =>
      ({ encodingMode } as Parameters<typeof resolveMode>[1]);
    const makeQrState = (encodingMode: string) =>
      ({ encodingMode } as Parameters<typeof resolveMode>[2]);

    it("returns qrState.encodingMode when isGeneratorSource", () => {
      expect(resolveMode(true, makeResult("numeric"), makeQrState("byte"))).toBe("byte");
    });

    it("returns result.encodingMode when not isGeneratorSource", () => {
      expect(resolveMode(false, makeResult("numeric"), makeQrState("byte"))).toBe("numeric");
    });

    it("returns undefined for invalid mode", () => {
      expect(resolveMode(false, makeResult("mixed"), makeQrState("byte"))).toBeUndefined();
    });

    it("accepts all valid modes", () => {
      for (const mode of ["numeric", "alphanumeric", "byte", "kanji", "auto"]) {
        expect(resolveMode(false, makeResult(mode), makeQrState("auto"))).toBe(mode);
      }
    });
  });

  describe("resolveEffectiveMode", () => {
    it("returns byte for bytes input with byte result", () => {
      expect(resolveEffectiveMode("bytes", "byte", "auto")).toBe("byte");
    });

    it("returns undefined for bytes input with non-byte result", () => {
      expect(resolveEffectiveMode("bytes", "numeric", "auto")).toBeUndefined();
    });

    it("returns modeToUse for string input", () => {
      expect(resolveEffectiveMode("string", "numeric", "alphanumeric")).toBe("alphanumeric");
    });

    it("returns undefined for string input with no mode", () => {
      expect(resolveEffectiveMode("string", "numeric", undefined)).toBeUndefined();
    });
  });

  describe("buildCandidateFrameIndices", () => {
    it("includes current index", () => {
      const result = buildCandidateFrameIndices(100, 42);
      expect(result).toContain(42);
    });

    it("includes quartile positions", () => {
      const result = buildCandidateFrameIndices(100, 0);
      expect(result).toContain(25);
      expect(result).toContain(50);
      expect(result).toContain(75);
      expect(result).toContain(99);
    });

    it("clamps to valid range", () => {
      const result = buildCandidateFrameIndices(10, 20);
      for (const idx of result) {
        expect(idx).toBeGreaterThanOrEqual(0);
        expect(idx).toBeLessThan(10);
      }
    });

    it("returns unique indices", () => {
      const result = buildCandidateFrameIndices(4, 0);
      const unique = new Set(result);
      expect(unique.size).toBe(result.length);
    });

    it("handles single frame", () => {
      const result = buildCandidateFrameIndices(1, 0);
      expect(result).toEqual([0]);
    });
  });

  describe("diffMatrices", () => {
    it("returns 0 diffs for identical matrices", () => {
      const m = [
        [true, false],
        [false, true],
      ];
      const result = diffMatrices(m, m);
      expect(result.diffCount).toBe(0);
      expect(result.diffPct).toBe(0);
      expect(result.firstDiff).toBeNull();
    });

    it("counts all diffs for opposite matrices", () => {
      const a = [
        [true, true],
        [true, true],
      ];
      const b = [
        [false, false],
        [false, false],
      ];
      const result = diffMatrices(a, b);
      expect(result.diffCount).toBe(4);
      expect(result.diffPct).toBe(1);
    });

    it("records first diff position", () => {
      const a = [
        [true, true],
        [false, true],
      ];
      const b = [
        [true, true],
        [true, true],
      ];
      const result = diffMatrices(a, b);
      expect(result.firstDiff).toEqual({ row: 1, col: 0, a: false, b: true });
    });

    it("handles different-sized matrices", () => {
      const a = [[true, false, true]];
      const b = [[true, false]];
      const result = diffMatrices(a, b);
      expect(result.cols).toBe(2);
    });

    it("handles empty matrices", () => {
      const result = diffMatrices([], []);
      expect(result.diffCount).toBe(0);
      expect(result.rows).toBe(0);
    });
  });

  describe("findBestMatrixShift", () => {
    it("returns zero shift for identical matrices", () => {
      const m = [
        [true, false, true],
        [false, true, false],
        [true, false, true],
      ];
      const result = findBestMatrixShift(m, m, 3);
      expect(result.dr).toBe(0);
      expect(result.dc).toBe(0);
      expect(result.diffCount).toBe(0);
      expect(result.diffPct).toBe(0);
    });

    it("finds a shift that reduces diffs", () => {
      const original = [
        [true, false, false],
        [false, false, false],
        [false, false, false],
      ];
      const shifted = [
        [false, false, false],
        [false, true, false],
        [false, false, false],
      ];
      const result = findBestMatrixShift(original, shifted, 3);
      expect(result.diffCount).toBeLessThan(9);
    });

    it("returns diffPct in [0, 1]", () => {
      const m = [
        [true, false],
        [false, true],
      ];
      const result = findBestMatrixShift(m, m, 2);
      expect(result.diffPct).toBeGreaterThanOrEqual(0);
      expect(result.diffPct).toBeLessThanOrEqual(1);
    });
  });

  describe("buildMaskPatternOption", () => {
    it("returns maskPattern for valid values 0-7", () => {
      for (let i = 0; i <= 7; i++) {
        expect(buildMaskPatternOption(i)).toEqual({ maskPattern: i });
      }
    });

    it("returns empty object for undefined", () => {
      expect(buildMaskPatternOption(undefined)).toEqual({});
    });

    it("returns empty object for out-of-range value", () => {
      expect(buildMaskPatternOption(8)).toEqual({});
      expect(buildMaskPatternOption(-1)).toEqual({});
    });
  });

  describe("resolveFinalVersion", () => {
    it("returns resultVersion when valid", () => {
      expect(resolveFinalVersion(5, 10)).toBe(5);
    });

    it("falls back to versionToUse when resultVersion is null", () => {
      expect(resolveFinalVersion(null, 10)).toBe(10);
    });

    it("returns null when both are null", () => {
      expect(resolveFinalVersion(null, null)).toBeNull();
    });

    it("rejects version 0", () => {
      expect(resolveFinalVersion(0, null)).toBeNull();
    });

    it("rejects version > 40", () => {
      expect(resolveFinalVersion(41, null)).toBeNull();
    });

    it("accepts boundary versions 1 and 40", () => {
      expect(resolveFinalVersion(1, null)).toBe(1);
      expect(resolveFinalVersion(40, null)).toBe(40);
    });
  });

  describe("buildEncoderInput", () => {
    it("returns string kind with payload when no bytes", () => {
      const result = buildEncoderInput(
        { payload: "hello", payloadBytes: undefined } as Parameters<typeof buildEncoderInput>[0],
        "auto",
      );
      expect(result).toEqual({ kind: "string", data: "hello" });
    });

    it("returns string kind when mode is not byte", () => {
      const result = buildEncoderInput(
        {
          payload: "123",
          payloadBytes: new Uint8Array([49, 50, 51]),
          encodingMode: "numeric",
        } as Parameters<typeof buildEncoderInput>[0],
        "numeric",
      );
      expect(result).toEqual({ kind: "string", data: "123" });
    });

    it("returns bytes kind when mode is byte and bytes present", () => {
      const result = buildEncoderInput(
        {
          payload: "AB",
          payloadBytes: new Uint8Array([65, 66]),
          encodingMode: "byte",
        } as Parameters<typeof buildEncoderInput>[0],
        "byte",
      );
      expect(result.kind).toBe("bytes");
      expect(result.data).toBe("AB");
    });

    it("returns bytes kind when result encoding is byte", () => {
      const result = buildEncoderInput(
        {
          payload: "test",
          payloadBytes: new Uint8Array([116, 101, 115, 116]),
          encodingMode: "byte",
        } as Parameters<typeof buildEncoderInput>[0],
        undefined,
      );
      expect(result.kind).toBe("bytes");
    });
  });

  describe("computeCanvasSizing", () => {
    it("computes from generator canvas when isGeneratorSource", () => {
      const canvas = { width: 400 } as HTMLCanvasElement;
      const result = computeCanvasSizing(true, canvas, 25, 4, 10);
      expect(result.size).toBe(400);
      expect(result.modulePx).toBeGreaterThanOrEqual(1);
    });

    it("computes default sizing when not generator source", () => {
      const result = computeCanvasSizing(false, null, 25, 4, 10);
      expect(result.modulePx).toBeGreaterThanOrEqual(3);
      expect(result.size).toBe((25 + 4 * 2) * result.modulePx);
    });

    it("ensures modulePx is at least 1 for generator source", () => {
      const canvas = { width: 10 } as HTMLCanvasElement;
      const result = computeCanvasSizing(true, canvas, 100, 10, 1);
      expect(result.modulePx).toBeGreaterThanOrEqual(1);
    });
  });

  describe("analyzePlatformRuntimeState", () => {
    beforeEach(() => {
      analyzePlatformRuntimeState.current = null;
    });

    it("starts as null", () => {
      expect(analyzePlatformRuntimeState.current).toBeNull();
    });

    it("is a mutable ref object", () => {
      const fake = { saveFileNative: async () => true } as AnalyzePlatformRuntime;
      analyzePlatformRuntimeState.current = fake;
      expect(analyzePlatformRuntimeState.current).toBe(fake);
    });
  });

  describe("configureAnalyzePlatformRuntime", () => {
    beforeEach(() => {
      analyzePlatformRuntimeState.current = null;
    });

    it("sets the runtime state", () => {
      const fake = { saveFileNative: async () => true } as AnalyzePlatformRuntime;
      configureAnalyzePlatformRuntime(fake);
      expect(analyzePlatformRuntimeState.current).toBe(fake);
    });

    it("overwrites previous runtime", () => {
      const first = { saveFileNative: async () => true } as AnalyzePlatformRuntime;
      const second = { saveFileNative: async () => false } as AnalyzePlatformRuntime;
      configureAnalyzePlatformRuntime(first);
      configureAnalyzePlatformRuntime(second);
      expect(analyzePlatformRuntimeState.current).toBe(second);
    });
  });

  describe("getAnalyzePlatformRuntime", () => {
    beforeEach(() => {
      analyzePlatformRuntimeState.current = null;
    });

    it("throws when not configured", () => {
      expect(() => getAnalyzePlatformRuntime()).toThrow(
        "Analyze platform runtime has not been configured",
      );
    });

    it("returns configured runtime", () => {
      const fake = { saveFileNative: async () => true } as AnalyzePlatformRuntime;
      configureAnalyzePlatformRuntime(fake);
      expect(getAnalyzePlatformRuntime()).toBe(fake);
    });

    it("returns same reference that was configured", () => {
      const fake = { saveFileNative: async () => true } as AnalyzePlatformRuntime;
      configureAnalyzePlatformRuntime(fake);
      const result1 = getAnalyzePlatformRuntime();
      const result2 = getAnalyzePlatformRuntime();
      expect(result1).toBe(result2);
    });
  });

  describe("resolveColors", () => {
    it("returns renderState colors when isGeneratorSource", () => {
      const result = resolveColors(
        true,
        { fgColor: "#ff0000", bgColor: "#00ff00", bgTransparent: false },
        { foreground: "#111", background: "#222" },
      );
      expect(result.fg).toBe("#ff0000");
      expect(result.bg).toBe("#00ff00");
    });

    it("returns detected colors when not isGeneratorSource", () => {
      const result = resolveColors(
        false,
        { fgColor: "#ff0000", bgColor: "#00ff00", bgTransparent: false },
        { foreground: "#111", background: "#222" },
      );
      expect(result.fg).toBe("#111");
      expect(result.bg).toBe("#222");
    });

    it("defaults to black/white when no detected colors", () => {
      const result = resolveColors(
        false,
        { fgColor: "#ff0000", bgColor: "#00ff00", bgTransparent: false },
        null,
      );
      expect(result.fg).toBe("#000000");
      expect(result.bg).toBe("#ffffff");
    });

    it("returns white bg when generator source with transparent bg", () => {
      const result = resolveColors(
        true,
        { fgColor: "#ff0000", bgColor: "#00ff00", bgTransparent: true },
        null,
      );
      expect(result.bg).toBe("#ffffff");
    });
  });
});
