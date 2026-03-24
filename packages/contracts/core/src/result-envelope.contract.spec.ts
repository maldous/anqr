import { describe, it, expect } from "vitest";
import type { ApiErrorDetail, ApiError, ApiSuccess, ApiResult } from "./result-envelope.contract";

describe("result-envelope.contract", () => {
  describe("Re-exported types", () => {
    it("should re-export ApiErrorDetail type", () => {
      const errorDetail: ApiErrorDetail = {
        message: "Error message",
        code: "ERROR_CODE",
        status: 400,
      };
      expect(errorDetail.message).toBe("Error message");
    });

    it("should re-export ApiError type", () => {
      const error: ApiError = {
        ok: false,
        error: {
          message: "Failed",
        },
      };
      expect(error.ok).toBe(false);
    });

    it("should re-export ApiSuccess type", () => {
      const success: ApiSuccess<string> = {
        ok: true,
        data: "Success",
      };
      expect(success.ok).toBe(true);
    });

    it("should re-export ApiResult type", () => {
      const successResult: ApiResult<number> = {
        ok: true,
        data: 123,
      };
      const errorResult: ApiResult<number> = {
        ok: false,
        error: {
          message: "Failed",
        },
      };
      expect(successResult.ok).toBe(true);
      expect(errorResult.ok).toBe(false);
    });
  });
});
