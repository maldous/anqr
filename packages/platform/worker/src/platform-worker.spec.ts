import { describe, it, expect, beforeEach } from "vitest";
import { clampPercent } from "./qart/clamp-percent";
import { packBooleanMatrix } from "./qart/pack-boolean-matrix";
import { cancelledRequestIds } from "./qart/cancelled-request-ids";
import { addCancelledRequestId } from "./qart/add-cancelled-request-id";
import { clearCancelledRequestId } from "./qart/clear-cancelled-request-id";
import { isCancelledOrStale } from "./qart/is-cancelled-or-stale";
import { latestRequestIdState } from "./qart/latest-request-id-state";
import { updateLatestRequestId } from "./qart/update-latest-request-id";
import { canRenderInWorker } from "./qart/can-render-in-worker";
import { toWorkerPayload } from "./qart/to-worker-payload";
import { DEFAULT_TIMEOUT_MS } from "./qart/worker-timeout-ms.const";
import { VALIDATION_WORKER_TIMEOUT_MS } from "./analyze/validation-worker-timeout.const";

describe("platform/worker", () => {
  beforeEach(() => {
    cancelledRequestIds.clear();
    latestRequestIdState.value = 0;
  });

  // ── clampPercent ───────────────────────────────────────────────

  describe("clampPercent", () => {
    it("returns value within range unchanged", () => {
      expect(clampPercent(50)).toBe(50);
    });

    it("clamps to 0 for negative values", () => {
      expect(clampPercent(-10)).toBe(0);
    });

    it("clamps to 100 for values above 100", () => {
      expect(clampPercent(150)).toBe(100);
    });

    it("returns 0 for boundary", () => {
      expect(clampPercent(0)).toBe(0);
    });

    it("returns 100 for boundary", () => {
      expect(clampPercent(100)).toBe(100);
    });

    it("returns 0 for NaN", () => {
      expect(clampPercent(NaN)).toBe(0);
    });

    it("returns 0 for Infinity", () => {
      expect(clampPercent(Infinity)).toBe(0);
    });

    it("returns 0 for -Infinity", () => {
      expect(clampPercent(-Infinity)).toBe(0);
    });
  });

  // ── packBooleanMatrix ──────────────────────────────────────────

  describe("packBooleanMatrix", () => {
    it("packs a 1x1 true matrix", () => {
      const result = packBooleanMatrix([[true]]);
      expect(result).toEqual(new Uint8Array([1]));
    });

    it("packs a 1x1 false matrix", () => {
      const result = packBooleanMatrix([[false]]);
      expect(result).toEqual(new Uint8Array([0]));
    });

    it("packs a 2x2 matrix in row-major order", () => {
      const result = packBooleanMatrix([
        [true, false],
        [false, true],
      ]);
      expect(result).toEqual(new Uint8Array([1, 0, 0, 1]));
    });

    it("packs all-true 3x3 matrix", () => {
      const matrix = Array.from({ length: 3 }, () => [true, true, true]);
      const result = packBooleanMatrix(matrix);
      expect(result).toEqual(new Uint8Array([1, 1, 1, 1, 1, 1, 1, 1, 1]));
    });

    it("packs all-false 2x2 matrix", () => {
      const matrix = Array.from({ length: 2 }, () => [false, false]);
      const result = packBooleanMatrix(matrix);
      expect(result).toEqual(new Uint8Array([0, 0, 0, 0]));
    });

    it("returns correct size for larger matrix", () => {
      const size = 5;
      const matrix = Array.from({ length: size }, () =>
        Array.from({ length: size }, () => false),
      );
      const result = packBooleanMatrix(matrix);
      expect(result.length).toBe(size * size);
    });
  });

  // ── cancelledRequestIds state ──────────────────────────────────

  describe("cancelledRequestIds", () => {
    it("starts empty", () => {
      expect(cancelledRequestIds.size).toBe(0);
    });

    it("tracks added IDs via addCancelledRequestId", () => {
      addCancelledRequestId(1);
      addCancelledRequestId(2);
      expect(cancelledRequestIds.has(1)).toBe(true);
      expect(cancelledRequestIds.has(2)).toBe(true);
      expect(cancelledRequestIds.has(3)).toBe(false);
    });

    it("removes IDs via clearCancelledRequestId", () => {
      addCancelledRequestId(5);
      expect(cancelledRequestIds.has(5)).toBe(true);
      clearCancelledRequestId(5);
      expect(cancelledRequestIds.has(5)).toBe(false);
    });

    it("clearing non-existent ID is a no-op", () => {
      clearCancelledRequestId(999);
      expect(cancelledRequestIds.size).toBe(0);
    });

    it("adding same ID twice does not duplicate", () => {
      addCancelledRequestId(3);
      addCancelledRequestId(3);
      expect(cancelledRequestIds.size).toBe(1);
    });
  });

  // ── latestRequestIdState ───────────────────────────────────────

  describe("latestRequestIdState", () => {
    it("starts at 0", () => {
      expect(latestRequestIdState.value).toBe(0);
    });

    it("can be set directly", () => {
      latestRequestIdState.value = 42;
      expect(latestRequestIdState.value).toBe(42);
    });
  });

  // ── updateLatestRequestId ──────────────────────────────────────

  describe("updateLatestRequestId", () => {
    it("increases to higher value", () => {
      updateLatestRequestId(10);
      expect(latestRequestIdState.value).toBe(10);
    });

    it("does not decrease", () => {
      updateLatestRequestId(10);
      updateLatestRequestId(5);
      expect(latestRequestIdState.value).toBe(10);
    });

    it("accepts same value", () => {
      updateLatestRequestId(7);
      updateLatestRequestId(7);
      expect(latestRequestIdState.value).toBe(7);
    });

    it("tracks monotonically increasing sequence", () => {
      updateLatestRequestId(1);
      updateLatestRequestId(3);
      updateLatestRequestId(2);
      updateLatestRequestId(5);
      expect(latestRequestIdState.value).toBe(5);
    });
  });

  // ── isCancelledOrStale ─────────────────────────────────────────

  describe("isCancelledOrStale", () => {
    it("returns false for current non-cancelled request", () => {
      updateLatestRequestId(1);
      expect(isCancelledOrStale(1)).toBe(false);
    });

    it("returns true for cancelled request", () => {
      updateLatestRequestId(1);
      addCancelledRequestId(1);
      expect(isCancelledOrStale(1)).toBe(true);
    });

    it("returns true for stale request", () => {
      updateLatestRequestId(5);
      expect(isCancelledOrStale(3)).toBe(true);
    });

    it("returns true when both cancelled and stale", () => {
      updateLatestRequestId(10);
      addCancelledRequestId(5);
      expect(isCancelledOrStale(5)).toBe(true);
    });

    it("returns false for latest non-cancelled ID", () => {
      updateLatestRequestId(3);
      addCancelledRequestId(1);
      expect(isCancelledOrStale(3)).toBe(false);
    });
  });

  // ── canRenderInWorker ──────────────────────────────────────────

  describe("canRenderInWorker", () => {
    it("returns false in Node environment", () => {
      expect(canRenderInWorker()).toBe(false);
    });

    it("returns a boolean", () => {
      expect(typeof canRenderInWorker()).toBe("boolean");
    });
  });

  // ── toWorkerPayload ────────────────────────────────────────────

  describe("toWorkerPayload", () => {
    const makeInput = (overrides?: Record<string, unknown>) => ({
      data: "https://example.com",
      ecc: "M",
      version: 5,
      targetImage: {
        data: new Uint8ClampedArray([255, 0, 0, 255, 0, 255, 0, 255]),
        width: 2,
        height: 1,
        colorSpace: "srgb",
      },
      ...overrides,
    }) as Parameters<typeof toWorkerPayload>[0];

    it("copies data field", () => {
      const result = toWorkerPayload(makeInput());
      expect(result.data).toBe("https://example.com");
    });

    it("copies ecc and version", () => {
      const result = toWorkerPayload(makeInput());
      expect(result.ecc).toBe("M");
      expect(result.version).toBe(5);
    });

    it("extracts image dimensions", () => {
      const result = toWorkerPayload(makeInput());
      expect(result.targetImageWidth).toBe(2);
      expect(result.targetImageHeight).toBe(1);
    });

    it("copies pixel data into new array", () => {
      const input = makeInput();
      const result = toWorkerPayload(input);
      expect(result.targetImagePixels).toBeInstanceOf(Uint8ClampedArray);
      expect(result.targetImagePixels.length).toBe(8);
      expect(result.targetImagePixels[0]).toBe(255);
    });

    it("creates independent copy of pixels", () => {
      const input = makeInput();
      const result = toWorkerPayload(input);
      result.targetImagePixels[0] = 0;
      expect(input.targetImage.data[0]).toBe(255);
    });

    it("preserves optional fields when set", () => {
      const result = toWorkerPayload(makeInput({
        maskPattern: 3,
        lockVersionToMinimum: true,
        strictSuffix: false,
        targetControlPercent: 75,
        searchAttempts: 100,
        searchSeed: 42,
        performanceProfile: "quality",
      }));
      expect(result.maskPattern).toBe(3);
      expect(result.lockVersionToMinimum).toBe(true);
      expect(result.searchAttempts).toBe(100);
      expect(result.performanceProfile).toBe("quality");
    });

    it("leaves optional fields undefined when not set", () => {
      const result = toWorkerPayload(makeInput());
      expect(result.maskPattern).toBeUndefined();
      expect(result.renderConfig).toBeUndefined();
    });
  });

  // ── Constants ──────────────────────────────────────────────────

  describe("constants", () => {
    it("DEFAULT_TIMEOUT_MS is 90 seconds", () => {
      expect(DEFAULT_TIMEOUT_MS).toBe(90_000);
    });

    it("VALIDATION_WORKER_TIMEOUT_MS is 10 seconds", () => {
      expect(VALIDATION_WORKER_TIMEOUT_MS).toBe(10_000);
    });
  });
});
