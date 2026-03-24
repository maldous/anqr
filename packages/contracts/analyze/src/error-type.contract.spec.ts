import { describe, it, expect } from "vitest";
import type { ErrorType } from "./error-type.contract";

describe("contracts/analyze/error-type", () => {
  describe("ErrorType", () => {
    it("accepts 'no_qr_detected' error type", () => {
      const errorType: ErrorType = "no_qr_detected";
      expect(errorType).toBe("no_qr_detected");
    });

    it("accepts 'cors_blocked' error type", () => {
      const errorType: ErrorType = "cors_blocked";
      expect(errorType).toBe("cors_blocked");
    });

    it("accepts 'decode_error' error type", () => {
      const errorType: ErrorType = "decode_error";
      expect(errorType).toBe("decode_error");
    });

    it("accepts 'unknown' error type", () => {
      const errorType: ErrorType = "unknown";
      expect(errorType).toBe("unknown");
    });

    it("has exactly 4 error type values", () => {
      const allTypes: ErrorType[] = ["no_qr_detected", "cors_blocked", "decode_error", "unknown"];
      expect(new Set(allTypes).size).toBe(4);
    });
  });
});
