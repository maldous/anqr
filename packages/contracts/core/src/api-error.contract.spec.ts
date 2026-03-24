import { describe, it, expect } from "vitest";
import type { ApiError } from "./api-error.contract";

describe("api-error.contract", () => {
  describe("ApiError interface", () => {
    it("should accept valid API error with error detail", () => {
      const error: ApiError = {
        ok: false,
        error: {
          message: "Failed to generate QR code",
          code: "GENERATION_ERROR",
          status: 500,
        },
      };
      expect(error.ok).toBe(false);
      expect(error.error.message).toBe("Failed to generate QR code");
      expect(error.error.code).toBe("GENERATION_ERROR");
      expect(error.error.status).toBe(500);
    });

    it("should have readonly ok field set to false", () => {
      const error: ApiError = {
        ok: false,
        error: {
          message: "Error occurred",
        },
      };
      expect(error.ok).toBe(false);
    });

    it("should support various error scenarios", () => {
      const validationError: ApiError = {
        ok: false,
        error: {
          message: "Invalid QR data",
          code: "VALIDATION_ERROR",
          status: 400,
        },
      };
      const authError: ApiError = {
        ok: false,
        error: {
          message: "Unauthorized",
          code: "AUTH_ERROR",
          status: 401,
        },
      };
      expect(validationError.ok).toBe(false);
      expect(authError.ok).toBe(false);
      expect(validationError.error.status).toBe(400);
      expect(authError.error.status).toBe(401);
    });
  });
});
