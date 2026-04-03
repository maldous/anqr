import { describe, it, expect, beforeEach } from "vitest";
import { clonePlainSerializable } from "./generation/clone-plain-serializable.service";
import { getQArtSearchAttempts } from "./generation/get-q-art-search-attempts.service";
import { expandPackedQArtMatrix } from "./generation/expand-packed-q-art-matrix.service";
import { localizeQArtProgressStage } from "./generation/localize-q-art-progress-stage.service";
import { checkOverflowContentChanged } from "./generation/check-overflow-content-changed.service";
import { buildEccFallbackSequence } from "./safety/build-ecc-fallback-sequence.service";
import { isRequestStale } from "./hooks/is-request-stale";
import { computePatternDrivenJitterValue } from "./frames/compute-pattern-driven-jitter-value.service";
import { isNoisyOutlierMatchCheck } from "./frames/is-noisy-outlier-match-check.service";
import { adjustOverlayIntensity } from "./safety/adjust-overlay-intensity.service";
import { resolveOverlayPreservationOptions } from "./generation/resolve-overlay-preservation-options.service";
import { buildBasicServerQRRequestParams } from "./server/build-basic-server-qr-request-params";
import { buildOverlayFilterOptionsFromServerParams } from "./server/build-overlay-filter-options-from-server-params";
import { resolveArtworkMaskPattern } from "./safety/resolve-artwork-mask-pattern.service";
import { computeSafetyAdjustments } from "./safety/compute-safety-adjustments.service";
import { safeMark } from "./generation/safe-mark.service";
import { safeMeasure } from "./generation/safe-measure.service";
import { toFullQArtPipelineResult } from "./safety/to-full-qart-pipeline-result";
import { generatorRuntimeState } from "./runtime/generator-runtime-state";
import { configureGeneratorRuntime } from "./runtime/configure-generator-runtime";
import { requireGeneratorRuntime } from "./runtime/require-generator-runtime";
import type { GeneratorRuntimeConfig } from "./runtime/generator-runtime.types";
import { qartSharedState } from "./qart/qart-shared-state-store";
import { getQartModulePromise } from "./qart/get-qart-module-promise";
import { setQartModulePromise } from "./qart/set-qart-module-promise";
import { sanitizeQArtRenderConfig } from "./generation/sanitize-q-art-render-config.service";
import { buildBasicGeneratorConfig } from "./server/build-basic-generator-config";
import { YieldController } from "./generation/generation-class-yieldcontroller";

describe("application/generator", () => {
  describe("clonePlainSerializable", () => {
    it("clones primitives", () => {
      expect(clonePlainSerializable("hello")).toBe("hello");
      expect(clonePlainSerializable(42)).toBe(42);
      expect(clonePlainSerializable(true)).toBe(true);
      expect(clonePlainSerializable(null)).toBeNull();
    });

    it("deep clones plain objects", () => {
      const obj = { a: 1, b: { c: 2 } };
      const cloned = clonePlainSerializable(obj) as typeof obj;
      expect(cloned).toEqual(obj);
      expect(cloned).not.toBe(obj);
      expect(cloned.b).not.toBe(obj.b);
    });

    it("deep clones arrays", () => {
      const arr = [1, [2, 3], { x: 4 }];
      const cloned = clonePlainSerializable(arr);
      expect(cloned).toEqual(arr);
      expect(cloned).not.toBe(arr);
    });

    it("returns undefined for non-plain objects", () => {
      expect(clonePlainSerializable(new Date())).toBeUndefined();
      expect(clonePlainSerializable(new Map())).toBeUndefined();
    });

    it("returns undefined for functions", () => {
      expect(clonePlainSerializable(() => {})).toBeUndefined();
    });

    it("strips undefined values from objects", () => {
      const obj = { a: 1, b: undefined };
      const cloned = clonePlainSerializable(obj) as Record<string, unknown>;
      expect(cloned).toEqual({ a: 1 });
      expect("b" in cloned).toBe(false);
    });

    it("handles nested non-plain objects by stripping them", () => {
      const obj = { a: 1, b: new Map() };
      const cloned = clonePlainSerializable(obj) as Record<string, unknown>;
      expect(cloned).toEqual({ a: 1 });
    });
  });

  describe("getQArtSearchAttempts", () => {
    it("returns 1 for undefined", () => {
      expect(getQArtSearchAttempts(undefined)).toBe(1);
    });

    it("returns 1 for NaN", () => {
      expect(getQArtSearchAttempts(NaN)).toBe(1);
    });

    it("returns 1 for small values", () => {
      expect(getQArtSearchAttempts(5000)).toBe(1);
    });

    it("returns 2 for 20000", () => {
      expect(getQArtSearchAttempts(20000)).toBe(2);
    });

    it("clamps to max 5", () => {
      expect(getQArtSearchAttempts(100000)).toBe(5);
    });

    it("returns 1 for 0", () => {
      expect(getQArtSearchAttempts(0)).toBe(1);
    });
  });

  describe("expandPackedQArtMatrix", () => {
    it("expands a 2x2 packed matrix", () => {
      const packed = new Uint8Array([1, 0, 0, 1]);
      const result = expandPackedQArtMatrix(packed, 2);
      expect(result).toEqual([
        [true, false],
        [false, true],
      ]);
    });

    it("expands a 3x3 packed matrix", () => {
      const packed = new Uint8Array([1, 1, 1, 0, 0, 0, 1, 0, 1]);
      const result = expandPackedQArtMatrix(packed, 3);
      expect(result[0]).toEqual([true, true, true]);
      expect(result[1]).toEqual([false, false, false]);
      expect(result[2]).toEqual([true, false, true]);
    });

    it("throws for mismatched length", () => {
      const packed = new Uint8Array([1, 0, 0]);
      expect(() => expandPackedQArtMatrix(packed, 2)).toThrow("Invalid packed matrix length");
    });

    it("handles 1x1 matrix", () => {
      const packed = new Uint8Array([1]);
      expect(expandPackedQArtMatrix(packed, 1)).toEqual([[true]]);
    });

    it("treats non-1 values as false", () => {
      const packed = new Uint8Array([2, 0, 255, 1]);
      const result = expandPackedQArtMatrix(packed, 2);
      expect(result[0][0]).toBe(false);
      expect(result[0][1]).toBe(false);
      expect(result[1][0]).toBe(false);
      expect(result[1][1]).toBe(true);
    });
  });

  describe("localizeQArtProgressStage", () => {
    const identity = (s: string) => s;
    const mockT = (_key: string, opts: Record<string, unknown>) => {
      let s = opts.defaultValue as string;
      for (const [k, v] of Object.entries(opts)) {
        if (k !== "defaultValue") s = s.replace(`{{${k}}}`, String(v));
      }
      return s;
    };

    it("returns translated stage for plain text", () => {
      expect(localizeQArtProgressStage("Processing", identity, mockT)).toBe("Processing");
    });

    it("formats mask stage pattern", () => {
      const result = localizeQArtProgressStage("Mask 3: Optimizing", identity, mockT);
      expect(result).toContain("Mask");
      expect(result).toContain("Optimizing");
    });

    it("formats attempt+mask stage pattern", () => {
      const result = localizeQArtProgressStage("Attempt 1/3: Mask 2: Rendering", identity, mockT);
      expect(result).toContain("Attempt");
      expect(result).toContain("Mask");
      expect(result).toContain("Rendering");
    });

    it("formats attempt stage without mask", () => {
      const result = localizeQArtProgressStage("Attempt 2/5: Building", identity, mockT);
      expect(result).toContain("Attempt");
      expect(result).toContain("Building");
    });

    it("strips trailing ellipsis from inner stage to avoid double dots", () => {
      const result = localizeQArtProgressStage("Mask 1: Loading...", identity, mockT);
      expect(result).not.toContain("Loading......");
      expect(result).toContain("Loading");
    });
  });

  describe("checkOverflowContentChanged", () => {
    it("returns true when content changed", () => {
      expect(checkOverflowContentChanged("old", "new")).toBe(true);
    });

    it("returns false when content is the same", () => {
      expect(checkOverflowContentChanged("same", "same")).toBe(false);
    });

    it("returns false when lastOverflowContent is null", () => {
      expect(checkOverflowContentChanged(null, "any")).toBe(false);
    });

    it("returns true when currentContent is undefined", () => {
      expect(checkOverflowContentChanged("old", undefined)).toBe(true);
    });
  });

  describe("buildEccFallbackSequence", () => {
    it("returns lower ECC levels starting after current for auto version", () => {
      expect(buildEccFallbackSequence("H", 0)).toEqual(["Q", "M", "L"]);
    });

    it("includes current level for fixed version", () => {
      expect(buildEccFallbackSequence("H", 5)).toEqual(["H", "Q", "M", "L"]);
    });

    it("returns [L] when at L with auto version", () => {
      expect(buildEccFallbackSequence("L", 0)).toEqual(["L"]);
    });

    it("returns [L] for unknown ECC", () => {
      const result = buildEccFallbackSequence("X", 0);
      expect(result).toContain("L");
    });

    it("returns all levels from Q for Q with fixed version", () => {
      expect(buildEccFallbackSequence("Q", 10)).toEqual(["Q", "M", "L"]);
    });

    it("returns M and L for M with auto version", () => {
      expect(buildEccFallbackSequence("M", 0)).toEqual(["L"]);
    });
  });

  describe("isRequestStale", () => {
    it("returns false when IDs match", () => {
      expect(isRequestStale({ current: 5 }, 5)).toBe(false);
    });

    it("returns true when IDs differ", () => {
      expect(isRequestStale({ current: 5 }, 3)).toBe(true);
    });

    it("returns true when ref is 0 and requestId is 1", () => {
      expect(isRequestStale({ current: 0 }, 1)).toBe(true);
    });
  });

  describe("computePatternDrivenJitterValue", () => {
    type Effect = Parameters<typeof computePatternDrivenJitterValue>[3][number];

    it("returns base jitter when no effects", () => {
      const result = computePatternDrivenJitterValue(0, 30, 0.5, []);
      expect(result).toBe(0.5);
    });

    it("adds jitter for pulse effect", () => {
      const effects: Effect[] = [{ pattern: "pulse" as Effect["pattern"], seed: 0, waveAxis: "y" }];
      const result = computePatternDrivenJitterValue(0, 30, 0, effects);
      expect(result).toBeGreaterThan(0);
    });

    it("adds jitter for wave effect", () => {
      const effects: Effect[] = [{ pattern: "wave" as Effect["pattern"], seed: 0, waveAxis: "y" }];
      const result = computePatternDrivenJitterValue(0, 30, 0, effects);
      expect(result).toBeGreaterThan(0);
    });

    it("clamps to maximum 2.4", () => {
      const effects: Effect[] = [
        { pattern: "pulse" as Effect["pattern"], seed: 0, waveAxis: "y" },
        { pattern: "wave" as Effect["pattern"], seed: 0, waveAxis: "y" },
        { pattern: "drift" as Effect["pattern"], seed: 0, waveAxis: "y" },
        { pattern: "shimmer" as Effect["pattern"], seed: 0, waveAxis: "y" },
      ];
      const result = computePatternDrivenJitterValue(0, 30, 2, effects);
      expect(result).toBeLessThanOrEqual(2.4);
    });

    it("clamps to minimum 0", () => {
      const result = computePatternDrivenJitterValue(0, 30, -5, []);
      expect(result).toBeGreaterThanOrEqual(0);
    });

    it("returns a number with at most 3 decimal places", () => {
      const effects: Effect[] = [
        { pattern: "scanline" as Effect["pattern"], seed: 7, waveAxis: "x" },
      ];
      const result = computePatternDrivenJitterValue(5, 30, 0.1, effects);
      const decimals = result.toString().split(".")[1];
      expect(decimals === undefined || decimals.length <= 3).toBe(true);
    });

    it("ignores unknown pattern types", () => {
      const effects: Effect[] = [
        { pattern: "unknown" as Effect["pattern"], seed: 0, waveAxis: "y" },
      ];
      const result = computePatternDrivenJitterValue(0, 30, 0.5, effects);
      expect(result).toBe(0.5);
    });
  });

  describe("isNoisyOutlierMatchCheck", () => {
    it("returns false for frame 0", () => {
      expect(isNoisyOutlierMatchCheck(50, 0, -1)).toBe(false);
    });

    it("returns true for non-finite match", () => {
      expect(isNoisyOutlierMatchCheck(Infinity, 1, 90)).toBe(true);
      expect(isNoisyOutlierMatchCheck(NaN, 1, 90)).toBe(true);
    });

    it("returns true when below minimum threshold with no history", () => {
      expect(isNoisyOutlierMatchCheck(50, 1, -1)).toBe(true);
    });

    it("returns false when above minimum threshold with no history", () => {
      expect(isNoisyOutlierMatchCheck(65, 1, -1)).toBe(false);
    });

    it("returns true when match drops too far from last success", () => {
      expect(isNoisyOutlierMatchCheck(75, 5, 90)).toBe(true);
    });

    it("returns false when match is close to last success", () => {
      expect(isNoisyOutlierMatchCheck(85, 5, 90)).toBe(false);
    });

    it("uses dynamic floor based on last success", () => {
      expect(isNoisyOutlierMatchCheck(80, 5, 90)).toBe(false);
      expect(isNoisyOutlierMatchCheck(77, 5, 90)).toBe(true);
    });
  });

  describe("adjustOverlayIntensity", () => {
    it("reduces intensity in strict mode when above safe limit", () => {
      const result = adjustOverlayIntensity({
        safetyMode: "strict",
        overlayEnabled: true,
        overlayIntensity: 50,
        maxSafeIntensity: 30,
        reduceIntensityUntilSafe: false,
        effectiveEcc: "H" as Parameters<typeof adjustOverlayIntensity>[0]["effectiveEcc"],
      });
      expect(result.intensity).toBe(30);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it("warns in balanced mode when above safe limit", () => {
      const result = adjustOverlayIntensity({
        safetyMode: "balanced",
        overlayEnabled: true,
        overlayIntensity: 50,
        maxSafeIntensity: 30,
        reduceIntensityUntilSafe: false,
        effectiveEcc: "M" as Parameters<typeof adjustOverlayIntensity>[0]["effectiveEcc"],
      });
      expect(result.intensity).toBe(50);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it("auto-reduces when reduceIntensityUntilSafe is true", () => {
      const result = adjustOverlayIntensity({
        safetyMode: "off",
        overlayEnabled: true,
        overlayIntensity: 50,
        maxSafeIntensity: 25,
        reduceIntensityUntilSafe: true,
        effectiveEcc: "L" as Parameters<typeof adjustOverlayIntensity>[0]["effectiveEcc"],
      });
      expect(result.intensity).toBe(25);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it("returns no warnings when overlay is disabled", () => {
      const result = adjustOverlayIntensity({
        safetyMode: "strict",
        overlayEnabled: false,
        overlayIntensity: 50,
        maxSafeIntensity: 30,
        reduceIntensityUntilSafe: false,
        effectiveEcc: "H" as Parameters<typeof adjustOverlayIntensity>[0]["effectiveEcc"],
      });
      expect(result.warnings).toEqual([]);
    });

    it("returns no warnings when intensity is within safe limit", () => {
      const result = adjustOverlayIntensity({
        safetyMode: "strict",
        overlayEnabled: true,
        overlayIntensity: 20,
        maxSafeIntensity: 30,
        reduceIntensityUntilSafe: false,
        effectiveEcc: "H" as Parameters<typeof adjustOverlayIntensity>[0]["effectiveEcc"],
      });
      expect(result.warnings).toEqual([]);
      expect(result.intensity).toBe(20);
    });
  });

  describe("resolveOverlayPreservationOptions", () => {
    const baseParams = {
      overlayEnabled: true,
      overlayMode: "blend" as string | undefined,
      safetyMode: "balanced",
      safetyLockFinders: true,
      safetyLockTiming: true,
      safetyLockAlign: true,
      safetyLockFormat: true,
      safetyLockVersion: true,
      preserveFinders: false,
      preserveTiming: false,
      preserveAlignment: false,
      protectFormatInfo: false,
      protectVersionInfo: false,
    };

    it("applies safety locks when overlay enabled and not dithered", () => {
      const result = resolveOverlayPreservationOptions(baseParams);
      expect(result.preserveFinders).toBe(true);
      expect(result.preserveTiming).toBe(true);
      expect(result.preserveAlignment).toBe(true);
      expect(result.protectFormatInfo).toBe(true);
      expect(result.protectVersionInfo).toBe(true);
    });

    it("skips safety locks for dithered overlay mode", () => {
      const result = resolveOverlayPreservationOptions({
        ...baseParams,
        overlayMode: "dithered",
      });
      expect(result.preserveFinders).toBe(false);
      expect(result.preserveTiming).toBe(false);
    });

    it("skips safety locks for blue_noise overlay mode", () => {
      const result = resolveOverlayPreservationOptions({
        ...baseParams,
        overlayMode: "blue_noise",
      });
      expect(result.preserveFinders).toBe(false);
    });

    it("skips safety locks when overlay is disabled", () => {
      const result = resolveOverlayPreservationOptions({
        ...baseParams,
        overlayEnabled: false,
      });
      expect(result.preserveFinders).toBe(false);
    });

    it("skips safety locks when safety is off", () => {
      const result = resolveOverlayPreservationOptions({
        ...baseParams,
        safetyMode: "off",
      });
      expect(result.preserveFinders).toBe(false);
    });

    it("ORs safety locks with user preferences", () => {
      const result = resolveOverlayPreservationOptions({
        ...baseParams,
        safetyLockFinders: false,
        preserveFinders: true,
      });
      expect(result.preserveFinders).toBe(true);
    });
  });

  describe("buildBasicServerQRRequestParams", () => {
    it("builds params with defaults for minimal input", () => {
      const result = buildBasicServerQRRequestParams({ data: "https://example.com" });
      expect(result.data).toBe("https://example.com");
      expect(result.size).toBe(400);
      expect(result.ec).toBe("H");
      expect(result.fg).toBe("000000");
      expect(result.bg).toBe("ffffff");
      expect(result.margin).toBe(4);
      expect(result.outputFormat).toBe("png");
    });

    it("uses provided size", () => {
      const result = buildBasicServerQRRequestParams({
        data: "test",
        size: 800,
      });
      expect(result.size).toBe(800);
      expect(result.outputWidth).toBe(800);
      expect(result.outputHeight).toBe(800);
    });

    it("uses provided error correction", () => {
      const result = buildBasicServerQRRequestParams({
        data: "test",
        errorCorrection: "L",
      });
      expect(result.ec).toBe("L");
    });

    it("uses provided colors", () => {
      const result = buildBasicServerQRRequestParams({
        data: "test",
        foreground: "ff0000",
        background: "00ff00",
      });
      expect(result.fg).toBe("ff0000");
      expect(result.bg).toBe("00ff00");
    });

    it("uses provided format", () => {
      const result = buildBasicServerQRRequestParams({
        data: "test",
        format: "svg" as Parameters<typeof buildBasicServerQRRequestParams>[0]["format"],
      });
      expect(result.outputFormat).toBe("svg");
      expect(result.explicitFormat).toBe("svg");
    });

    it("sets sensible safety defaults", () => {
      const result = buildBasicServerQRRequestParams({ data: "test" });
      expect(result.preserveFinders).toBe(true);
      expect(result.preserveTiming).toBe(true);
      expect(result.preserveAlignment).toBe(true);
      expect(result.protectFormatInfo).toBe(true);
      expect(result.crispEdges).toBe(true);
      expect(result.safetyMode).toBe("balanced");
    });

    it("sets animation defaults to none", () => {
      const result = buildBasicServerQRRequestParams({ data: "test" });
      expect(result.animationPattern).toBe("none");
      expect(result.animationPattern2).toBe("none");
      expect(result.animationLoop).toBe(true);
    });
  });

  describe("resolveArtworkMaskPattern", () => {
    it("returns undefined when useAutoMask and no locked mask", () => {
      expect(resolveArtworkMaskPattern(true, -1, 3)).toBeUndefined();
    });

    it("returns locked mask when non-negative regardless of autoMask", () => {
      expect(resolveArtworkMaskPattern(true, 5, 3)).toBe(5);
      expect(resolveArtworkMaskPattern(false, 5, 3)).toBe(5);
    });

    it("returns locked mask 0 when 0", () => {
      expect(resolveArtworkMaskPattern(false, 0, 7)).toBe(0);
    });

    it("returns configMaskPattern when not auto and no locked mask", () => {
      expect(resolveArtworkMaskPattern(false, -1, 4)).toBe(4);
    });

    it("returns configMaskPattern 0 when not auto and no locked mask", () => {
      expect(resolveArtworkMaskPattern(false, -1, 0)).toBe(0);
    });
  });

  describe("computeSafetyAdjustments", () => {
    type EccParam = Parameters<typeof computeSafetyAdjustments>[0]["effectiveEcc"];

    const baseParams = {
      safetyMode: "balanced",
      minModulePx: 3,
      minQuietZoneModules: 4,
      maxOverlayIntensityByEcc: { L: 30, M: 40, Q: 50, H: 60 } as Record<string, number>,
      modulePx: 5,
      moduleGapPercent: 0,
      moduleStyle: "square",
      quietZoneModules: 4,
      ecc: "H" as EccParam,
      overlayEnabled: false,
      overlayIntensity: 0,
      pickEcc: false,
      reduceIntensityUntilSafe: false,
      autoPickedEcc: "H" as EccParam,
      effectiveEcc: "H" as EccParam,
    };

    it("returns no warnings when everything is safe", () => {
      const result = computeSafetyAdjustments(baseParams);
      expect(result.warnings).toEqual([]);
      expect(result.modulePx).toBe(5);
      expect(result.quietZone).toBe(4);
    });

    it("increases modulePx when below minimum", () => {
      const result = computeSafetyAdjustments({
        ...baseParams,
        modulePx: 1,
      });
      expect(result.modulePx).toBe(3);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it("increases quiet zone when below minimum", () => {
      const result = computeSafetyAdjustments({
        ...baseParams,
        quietZoneModules: 2,
      });
      expect(result.quietZone).toBe(4);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it("warns about large module gaps", () => {
      const result = computeSafetyAdjustments({
        ...baseParams,
        moduleGapPercent: 25,
      });
      expect(result.warnings).toContain("Large module gaps may affect QR readability");
    });

    it("warns about dots with large gaps", () => {
      const result = computeSafetyAdjustments({
        ...baseParams,
        moduleStyle: "dots",
        moduleGapPercent: 15,
      });
      expect(result.warnings).toContain("Dots with large gaps may be hard to scan");
    });

    it("does not warn about dots with small gaps", () => {
      const result = computeSafetyAdjustments({
        ...baseParams,
        moduleStyle: "dots",
        moduleGapPercent: 5,
      });
      expect(result.warnings.some((w) => w.includes("Dots"))).toBe(false);
    });

    it("skips all safety adjustments when safetyMode is off", () => {
      const result = computeSafetyAdjustments({
        ...baseParams,
        safetyMode: "off",
        modulePx: 1,
        quietZoneModules: 1,
        moduleGapPercent: 30,
      });
      expect(result.modulePx).toBe(1);
      expect(result.quietZone).toBe(1);
      expect(result.warnings.every((w) => !w.includes("Module size"))).toBe(true);
    });

    it("warns when auto-picked ECC differs from configured", () => {
      const result = computeSafetyAdjustments({
        ...baseParams,
        pickEcc: true,
        autoPickedEcc: "M" as EccParam,
        ecc: "H" as EccParam,
      });
      expect(result.warnings.some((w) => w.includes("Auto-selected ECC level M"))).toBe(true);
    });

    it("does not warn when auto-picked ECC matches configured", () => {
      const result = computeSafetyAdjustments({
        ...baseParams,
        pickEcc: true,
        autoPickedEcc: "H" as EccParam,
        ecc: "H" as EccParam,
      });
      expect(result.warnings.some((w) => w.includes("Auto-selected"))).toBe(false);
    });

    it("returns effectiveEcc in result", () => {
      const result = computeSafetyAdjustments({
        ...baseParams,
        effectiveEcc: "Q" as EccParam,
      });
      expect(result.ecc).toBe("Q");
    });

    it("adjusts overlay intensity via adjustOverlayIntensity", () => {
      const result = computeSafetyAdjustments({
        ...baseParams,
        safetyMode: "strict",
        overlayEnabled: true,
        overlayIntensity: 80,
        effectiveEcc: "H" as EccParam,
      });
      expect(result.intensity).toBeLessThanOrEqual(60);
    });
  });

  describe("safeMark", () => {
    it("does not throw", () => {
      expect(() => safeMark("test-mark")).not.toThrow();
    });

    it("creates a performance mark", () => {
      safeMark("safe-mark-test");
      const entries = performance.getEntriesByName("safe-mark-test", "mark");
      expect(entries.length).toBeGreaterThanOrEqual(1);
      performance.clearMarks("safe-mark-test");
    });
  });

  describe("safeMeasure", () => {
    it("returns duration between two marks", () => {
      performance.mark("sm-start");
      performance.mark("sm-end");
      const duration = safeMeasure("sm-test", "sm-start", "sm-end");
      expect(typeof duration).toBe("number");
      expect(duration).toBeGreaterThanOrEqual(0);
      performance.clearMarks("sm-start");
      performance.clearMarks("sm-end");
    });

    it("returns null when start mark does not exist", () => {
      const result = safeMeasure("sm-missing", "nonexistent-start", "nonexistent-end");
      expect(result).toBeNull();
    });

    it("cleans up measure entries", () => {
      performance.mark("sm-clean-start");
      performance.mark("sm-clean-end");
      safeMeasure("sm-clean", "sm-clean-start", "sm-clean-end");
      const entries = performance.getEntriesByName("sm-clean", "measure");
      expect(entries.length).toBe(0);
      performance.clearMarks("sm-clean-start");
      performance.clearMarks("sm-clean-end");
    });
  });

  describe("toFullQArtPipelineResult", () => {
    it("converts string encodedData to Uint8Array", () => {
      const input = {
        success: true,
        matrix: [[true]],
        moduleCount: 1,
        version: 1,
        maskPattern: 0,
        matchingPixels: 100,
        totalControllable: 200,
        matchPercentage: 50,
        encodedData: "hello",
      };
      const result = toFullQArtPipelineResult(
        input as Parameters<typeof toFullQArtPipelineResult>[0],
      );
      expect(ArrayBuffer.isView(result.encodedData)).toBe(true);
      expect(result.encodedData.constructor.name).toBe("Uint8Array");
      expect(new TextDecoder().decode(result.encodedData)).toBe("hello");
    });

    it("preserves Uint8Array encodedData", () => {
      const data = new Uint8Array([65, 66, 67]);
      const input = {
        success: true,
        matrix: [[true]],
        moduleCount: 1,
        version: 1,
        maskPattern: 0,
        matchingPixels: 100,
        totalControllable: 200,
        matchPercentage: 50,
        encodedData: data,
      };
      const result = toFullQArtPipelineResult(
        input as unknown as Parameters<typeof toFullQArtPipelineResult>[0],
      );
      expect(result.encodedData).toBe(data);
    });

    it("spreads all other properties", () => {
      const input = {
        success: false,
        error: "test error",
        matrix: [[true]],
        matchingPixels: 10,
        totalControllable: 20,
        matchPercentage: 50,
        version: 5,
        maskPattern: 3,
        moduleCount: 37,
        encodedData: "abc",
      };
      const result = toFullQArtPipelineResult(
        input as Parameters<typeof toFullQArtPipelineResult>[0],
      );
      expect(result.success).toBe(false);
      expect(result.error).toBe("test error");
      expect(result.version).toBe(5);
      expect(result.maskPattern).toBe(3);
      expect(result.moduleCount).toBe(37);
    });
  });

  describe("generatorRuntimeState", () => {
    beforeEach(() => {
      generatorRuntimeState.current = null;
    });

    it("starts as null", () => {
      expect(generatorRuntimeState.current).toBeNull();
    });

    it("is a mutable ref object", () => {
      const fake = {} as GeneratorRuntimeConfig;
      generatorRuntimeState.current = fake;
      expect(generatorRuntimeState.current).toBe(fake);
    });
  });

  describe("configureGeneratorRuntime", () => {
    beforeEach(() => {
      generatorRuntimeState.current = null;
    });

    it("sets the runtime state", () => {
      const fake = {} as GeneratorRuntimeConfig;
      configureGeneratorRuntime(fake);
      expect(generatorRuntimeState.current).toBe(fake);
    });

    it("overwrites previous runtime", () => {
      const first = { tag: 1 } as unknown as GeneratorRuntimeConfig;
      const second = { tag: 2 } as unknown as GeneratorRuntimeConfig;
      configureGeneratorRuntime(first);
      configureGeneratorRuntime(second);
      expect(generatorRuntimeState.current).toBe(second);
    });
  });

  describe("requireGeneratorRuntime", () => {
    beforeEach(() => {
      generatorRuntimeState.current = null;
    });

    it("throws when not configured", () => {
      expect(() => requireGeneratorRuntime()).toThrow("Generator runtime has not been configured");
    });

    it("returns configured runtime", () => {
      const fake = {} as GeneratorRuntimeConfig;
      configureGeneratorRuntime(fake);
      expect(requireGeneratorRuntime()).toBe(fake);
    });
  });

  describe("qartSharedState", () => {
    beforeEach(() => {
      qartSharedState.modulePromise = null;
    });

    it("starts with null modulePromise", () => {
      expect(qartSharedState.modulePromise).toBeNull();
    });
  });

  describe("getQartModulePromise", () => {
    beforeEach(() => {
      qartSharedState.modulePromise = null;
    });

    it("returns null when not set", () => {
      expect(getQartModulePromise()).toBeNull();
    });

    it("returns the stored promise", () => {
      const promise = Promise.resolve({}) as ReturnType<typeof getQartModulePromise>;
      qartSharedState.modulePromise = promise;
      expect(getQartModulePromise()).toBe(promise);
    });
  });

  describe("setQartModulePromise", () => {
    beforeEach(() => {
      qartSharedState.modulePromise = null;
    });

    it("stores the promise", () => {
      const promise = Promise.resolve({}) as Parameters<typeof setQartModulePromise>[0];
      setQartModulePromise(promise);
      expect(qartSharedState.modulePromise).toBe(promise);
    });

    it("overwrites previous promise", () => {
      const first = Promise.resolve({}) as Parameters<typeof setQartModulePromise>[0];
      const second = Promise.resolve({}) as Parameters<typeof setQartModulePromise>[0];
      setQartModulePromise(first);
      setQartModulePromise(second);
      expect(qartSharedState.modulePromise).toBe(second);
    });
  });

  describe("sanitizeQArtRenderConfig", () => {
    it("returns cloned plain object", () => {
      const config = { content: "test", errorCorrection: "H" };
      const result = sanitizeQArtRenderConfig(
        config as Parameters<typeof sanitizeQArtRenderConfig>[0],
      );
      expect(result).toEqual(config);
      expect(result).not.toBe(config);
    });

    it("returns empty object for non-cloneable config", () => {
      const result = sanitizeQArtRenderConfig((() => {}) as unknown as Parameters<
        typeof sanitizeQArtRenderConfig
      >[0]);
      expect(result).toEqual({});
    });

    it("strips non-serializable nested values", () => {
      const config = { content: "test", callback: new Map() };
      const result = sanitizeQArtRenderConfig(
        config as unknown as Parameters<typeof sanitizeQArtRenderConfig>[0],
      );
      expect(result).toEqual({ content: "test" });
    });
  });

  describe("buildBasicGeneratorConfig", () => {
    it("maps content from data field", () => {
      const params = { data: "https://example.com", margin: 4, borderModulesExtra: 0 };
      const result = buildBasicGeneratorConfig(
        params as Parameters<typeof buildBasicGeneratorConfig>[0],
        10,
      );
      expect(result.content).toBe("https://example.com");
    });

    it("uses provided moduleSize", () => {
      const params = { data: "test", margin: 4, borderModulesExtra: 0 };
      const result = buildBasicGeneratorConfig(
        params as Parameters<typeof buildBasicGeneratorConfig>[0],
        15,
      );
      expect(result.moduleSize).toBe(15);
    });

    it("computes margin as margin + borderModulesExtra", () => {
      const params = { data: "test", margin: 4, borderModulesExtra: 2 };
      const result = buildBasicGeneratorConfig(
        params as Parameters<typeof buildBasicGeneratorConfig>[0],
        10,
      );
      expect(result.margin).toBe(6);
    });

    it("prefixes fg and bg with hash", () => {
      const params = { data: "test", margin: 0, borderModulesExtra: 0, fg: "ff0000", bg: "00ff00" };
      const result = buildBasicGeneratorConfig(
        params as Parameters<typeof buildBasicGeneratorConfig>[0],
        10,
      );
      expect(result.fgColor).toBe("#ff0000");
      expect(result.bgColor).toBe("#00ff00");
    });

    it("maps transparent to transparentBg", () => {
      const params = { data: "test", margin: 0, borderModulesExtra: 0, transparent: true };
      const result = buildBasicGeneratorConfig(
        params as Parameters<typeof buildBasicGeneratorConfig>[0],
        10,
      );
      expect(result.transparentBg).toBe(true);
    });

    it("maps overlayInvert to invertImage", () => {
      const params = { data: "test", margin: 0, borderModulesExtra: 0, overlayInvert: true };
      const result = buildBasicGeneratorConfig(
        params as Parameters<typeof buildBasicGeneratorConfig>[0],
        10,
      );
      expect(result.invertImage).toBe(true);
    });

    it("builds gradient when type is not none", () => {
      const params = {
        data: "test",
        margin: 0,
        borderModulesExtra: 0,
        gradientType: "linear",
        gradientAngle: 45,
        gradientStops: ["#000", "#fff"],
      };
      const result = buildBasicGeneratorConfig(
        params as unknown as Parameters<typeof buildBasicGeneratorConfig>[0],
        10,
      );
      expect(result.gradient).toEqual({
        type: "linear",
        angle: 45,
        stops: ["#000", "#fff"],
      });
    });

    it("sets gradient to undefined when type is none", () => {
      const params = { data: "test", margin: 0, borderModulesExtra: 0, gradientType: "none" };
      const result = buildBasicGeneratorConfig(
        params as Parameters<typeof buildBasicGeneratorConfig>[0],
        10,
      );
      expect(result.gradient).toBeUndefined();
    });

    it("builds duotoneColors from two params", () => {
      const params = {
        data: "test",
        margin: 0,
        borderModulesExtra: 0,
        duotoneColor1: "#000",
        duotoneColor2: "#fff",
      };
      const result = buildBasicGeneratorConfig(
        params as Parameters<typeof buildBasicGeneratorConfig>[0],
        10,
      );
      expect(result.duotoneColors).toEqual(["#000", "#fff"]);
    });

    it("builds maxOverlayIntensityByEcc from individual params", () => {
      const params = {
        data: "test",
        margin: 0,
        borderModulesExtra: 0,
        maxOverlayIntensityL: 30,
        maxOverlayIntensityM: 40,
        maxOverlayIntensityQ: 50,
        maxOverlayIntensityH: 60,
      };
      const result = buildBasicGeneratorConfig(
        params as Parameters<typeof buildBasicGeneratorConfig>[0],
        10,
      );
      expect(result.maxOverlayIntensityByEcc).toEqual({ L: 30, M: 40, Q: 50, H: 60 });
    });

    it("always sets scanGateProfile to full", () => {
      const params = { data: "test", margin: 0, borderModulesExtra: 0 };
      const result = buildBasicGeneratorConfig(
        params as Parameters<typeof buildBasicGeneratorConfig>[0],
        10,
      );
      expect(result.scanGateProfile).toBe("full");
    });

    it("maps subpixelGridNum to subpixelGrid", () => {
      const params = { data: "test", margin: 0, borderModulesExtra: 0, subpixelGridNum: 3 };
      const result = buildBasicGeneratorConfig(
        params as Parameters<typeof buildBasicGeneratorConfig>[0],
        10,
      );
      expect(result.subpixelGrid).toBe(3);
    });
  });

  describe("YieldController", () => {
    it("can be instantiated", () => {
      const ctrl = new YieldController();
      expect(ctrl).toBeInstanceOf(YieldController);
    });

    it("shouldYield returns true initially (lastYieldTime is 0)", () => {
      const ctrl = new YieldController();
      expect(ctrl.shouldYield()).toBe(true);
    });

    it("shouldYield returns false immediately after reset", () => {
      const ctrl = new YieldController();
      ctrl.reset();
      expect(ctrl.shouldYield()).toBe(false);
    });

    it("reset sets lastYieldTime to current time", () => {
      const ctrl = new YieldController();
      ctrl.reset();
      expect(ctrl.shouldYield()).toBe(false);
    });

    it("yieldIfNeeded returns a promise", () => {
      const ctrl = new YieldController();
      ctrl.reset();
      const result = ctrl.yieldIfNeeded();
      expect(result).toBeInstanceOf(Promise);
    });

    it("yieldIfNeeded resolves to false when no yield needed", async () => {
      const ctrl = new YieldController();
      ctrl.reset();
      const didYield = await ctrl.yieldIfNeeded();
      expect(didYield).toBe(false);
    });

    it("yieldIfNeeded resolves to true when yield is needed", async () => {
      const ctrl = new YieldController();
      const didYield = await ctrl.yieldIfNeeded();
      expect(didYield).toBe(true);
    });
  });

  describe("buildOverlayFilterOptionsFromServerParams", () => {
    it("maps overlay filter fields from server params", () => {
      const params = {
        overlayBrightness: 1.2,
        overlayContrast: 0.8,
        overlayGamma: 1.5,
        overlaySaturation: 0.9,
        overlayHueRotate: 45,
        overlayInvert: true,
        overlayBlur: 2,
        overlaySharpen: 1,
        overlayPosterize: 4,
        overlayThreshold: 128,
        overlayEdgeDetect: "sobel",
      } as Parameters<typeof buildOverlayFilterOptionsFromServerParams>[0];

      const result = buildOverlayFilterOptionsFromServerParams(params);
      expect(result.brightness).toBe(1.2);
      expect(result.contrast).toBe(0.8);
      expect(result.gamma).toBe(1.5);
      expect(result.saturation).toBe(0.9);
      expect(result.hue).toBe(45);
      expect(result.invert).toBe(true);
      expect(result.blur).toBe(2);
      expect(result.sharpen).toBe(1);
      expect(result.posterize).toBe(4);
      expect(result.threshold).toBe(128);
      expect(result.edge).toBe("sobel");
    });

    it("handles default values", () => {
      const params = {
        overlayBrightness: 1,
        overlayContrast: 1,
        overlayGamma: 1,
        overlaySaturation: 1,
        overlayHueRotate: 0,
        overlayInvert: false,
        overlayBlur: 0,
        overlaySharpen: 0,
        overlayPosterize: 0,
        overlayThreshold: undefined,
        overlayEdgeDetect: "off",
      } as Parameters<typeof buildOverlayFilterOptionsFromServerParams>[0];

      const result = buildOverlayFilterOptionsFromServerParams(params);
      expect(result.brightness).toBe(1);
      expect(result.invert).toBe(false);
      expect(result.threshold).toBeUndefined();
    });
  });
});
