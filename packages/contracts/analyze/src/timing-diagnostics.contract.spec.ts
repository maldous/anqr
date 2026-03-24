import { describe, it, expect } from "vitest";
import type { TimingDiagnostics } from "./timing-diagnostics.contract";

describe("contracts/analyze/timing-diagnostics", () => {
  describe("TimingDiagnostics", () => {
    it("accepts all timing fields populated", () => {
      const timing: TimingDiagnostics = {
        decodeMs: 50,
        totalAnalysisMs: 150,
        encodeMs: 30,
        renderMs: 40,
        exportMs: 30,
      };
      expect(timing.decodeMs).toBe(50);
      expect(timing.totalAnalysisMs).toBe(150);
    });

    it("accepts empty timing diagnostics", () => {
      const timing: TimingDiagnostics = {};
      expect(timing.decodeMs).toBeUndefined();
    });

    it("accepts null values for timing fields", () => {
      const timing: TimingDiagnostics = {
        decodeMs: null,
        totalAnalysisMs: null,
        encodeMs: null,
        renderMs: null,
        exportMs: null,
      };
      expect(timing.decodeMs).toBeNull();
    });

    it("accepts fractional millisecond values", () => {
      const timing: TimingDiagnostics = {
        decodeMs: 12.5,
        totalAnalysisMs: 100.75,
        renderMs: 25.33,
      };
      expect(timing.decodeMs).toBeCloseTo(12.5);
    });

    it("accepts zero timing values", () => {
      const timing: TimingDiagnostics = {
        decodeMs: 0,
        totalAnalysisMs: 0,
      };
      expect(timing.decodeMs).toBe(0);
    });
  });
});
