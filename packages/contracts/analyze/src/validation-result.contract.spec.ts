import { describe, it, expect } from "vitest";
import type { ValidationResult } from "./validation-result.contract";

describe("contracts/analyze/validation-result", () => {
  describe("ValidationResult", () => {
    it("accepts valid result with high confidence", () => {
      const result: ValidationResult = {
        valid: true,
        data: "https://example.com",
        confidence: "high",
      };
      expect(result.valid).toBe(true);
      expect(result.confidence).toBe("high");
    });

    it("accepts invalid result with error", () => {
      const result: ValidationResult = {
        valid: false,
        error: "No QR code detected",
        confidence: "low",
      };
      expect(result.valid).toBe(false);
      expect(result.error).toBe("No QR code detected");
    });

    it("accepts medium confidence result", () => {
      const result: ValidationResult = {
        valid: true,
        data: "Test data",
        confidence: "medium",
      };
      expect(result.confidence).toBe("medium");
    });

    it("accepts all confidence levels", () => {
      const levels: Array<ValidationResult["confidence"]> = ["high", "medium", "low"];
      expect(new Set(levels).size).toBe(3);
    });

    it("accepts result with both data and error", () => {
      const result: ValidationResult = {
        valid: false,
        data: "Partial scan",
        error: "Low quality image",
        confidence: "low",
      };
      expect(result.data).toBe("Partial scan");
      expect(result.error).toBe("Low quality image");
    });
  });
});
