import { describe, it, expect } from "vitest";
import type { QRQualityAssuranceOptions } from "./qr-quality-assurance-options.contract";

describe("qr-quality-assurance-options.contract", () => {
  describe("QRQualityAssuranceOptions interface", () => {
    it("should accept valid QA options", () => {
      const options: QRQualityAssuranceOptions = {
        contrastCheck: true,
        simulateBlurPx: 2,
        simulateNoise: 0.1,
        simulateRotationDeg: 5,
        showHeatmap: false,
      };
      expect(options.contrastCheck).toBe(true);
      expect(options.simulateBlurPx).toBe(2);
      expect(options.simulateNoise).toBe(0.1);
      expect(options.simulateRotationDeg).toBe(5);
      expect(options.showHeatmap).toBe(false);
    });

    it("should support disabled QA options", () => {
      const options: QRQualityAssuranceOptions = {
        contrastCheck: false,
        simulateBlurPx: 0,
        simulateNoise: 0,
        simulateRotationDeg: 0,
        showHeatmap: false,
      };
      expect(options.contrastCheck).toBe(false);
      expect(options.simulateBlurPx).toBe(0);
      expect(options.simulateNoise).toBe(0);
      expect(options.simulateRotationDeg).toBe(0);
    });

    it("should support QA options with heatmap visualization", () => {
      const options: QRQualityAssuranceOptions = {
        contrastCheck: true,
        simulateBlurPx: 1,
        simulateNoise: 0.05,
        simulateRotationDeg: 3,
        showHeatmap: true,
      };
      expect(options.showHeatmap).toBe(true);
      expect(options.contrastCheck).toBe(true);
    });
  });
});
