import { describe, it, expect } from "vitest";
import type { ApiErrorDetail, ApiError, ApiSuccess, ApiResult, ApiErrorResponse } from "./index";

describe("contracts/core", () => {
  describe("ApiErrorDetail", () => {
    it("accepts a minimal error detail with only message", () => {
      const detail: ApiErrorDetail = { message: "Something went wrong" };
      expect(detail.message).toBe("Something went wrong");
      expect(detail.code).toBeUndefined();
      expect(detail.status).toBeUndefined();
    });

    it("accepts a full error detail with all fields", () => {
      const detail: ApiErrorDetail = {
        message: "Not found",
        code: "NOT_FOUND",
        status: 404,
      };
      expect(detail.message).toBe("Not found");
      expect(detail.code).toBe("NOT_FOUND");
      expect(detail.status).toBe(404);
    });
  });

  describe("ApiError", () => {
    it("has ok set to false and contains an error detail", () => {
      const error: ApiError = {
        ok: false,
        error: { message: "Bad request" },
      };
      expect(error.ok).toBe(false);
      expect(error.error.message).toBe("Bad request");
    });

    it("nests a full ApiErrorDetail with all optional fields", () => {
      const error: ApiError = {
        ok: false,
        error: { message: "Rate limited", code: "RATE_LIMIT", status: 429 },
      };
      expect(error.error.code).toBe("RATE_LIMIT");
      expect(error.error.status).toBe(429);
    });
  });

  describe("ApiSuccess", () => {
    it("has ok set to true and wraps arbitrary data", () => {
      const success: ApiSuccess<string> = { ok: true, data: "hello" };
      expect(success.ok).toBe(true);
      expect(success.data).toBe("hello");
    });

    it("wraps complex objects", () => {
      const payload = { id: 1, name: "test" };
      const success: ApiSuccess<typeof payload> = { ok: true, data: payload };
      expect(success.data).toEqual({ id: 1, name: "test" });
    });

    it("wraps arrays", () => {
      const success: ApiSuccess<number[]> = { ok: true, data: [1, 2, 3] };
      expect(success.data).toHaveLength(3);
    });

    it("wraps null data", () => {
      const success: ApiSuccess<null> = { ok: true, data: null };
      expect(success.data).toBeNull();
    });

    it("wraps nested generic types", () => {
      const success: ApiSuccess<ApiSuccess<number>> = {
        ok: true,
        data: { ok: true, data: 42 },
      };
      expect(success.data.data).toBe(42);
    });
  });

  describe("ApiResult discriminated union", () => {
    function processResult(result: ApiResult<number>): string {
      if (result.ok) {
        return `success:${result.data}`;
      }
      return `error:${result.error.message}`;
    }

    it("narrows to ApiSuccess when ok is true", () => {
      const result: ApiResult<number> = { ok: true, data: 42 };
      expect(processResult(result)).toBe("success:42");
    });

    it("narrows to ApiError when ok is false", () => {
      const result: ApiResult<number> = {
        ok: false,
        error: { message: "fail" },
      };
      expect(processResult(result)).toBe("error:fail");
    });

    it("discriminates correctly with strict equality", () => {
      const success: ApiResult<string> = { ok: true, data: "value" };
      const error: ApiResult<string> = {
        ok: false,
        error: { message: "oops" },
      };
      expect(success.ok).toStrictEqual(true);
      expect(error.ok).toStrictEqual(false);
    });

    it("works with void data type", () => {
      const result: ApiResult<void> = { ok: true, data: undefined };
      expect(result.ok).toBe(true);
    });

    it("works with union data types", () => {
      const result: ApiResult<string | number> = { ok: true, data: "text" };
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(typeof result.data).toBe("string");
      }
    });

    it("preserves error detail through discrimination", () => {
      const result: ApiResult<string> = {
        ok: false,
        error: { message: "timeout", code: "TIMEOUT", status: 504 },
      };
      if (!result.ok) {
        expect(result.error.code).toBe("TIMEOUT");
        expect(result.error.status).toBe(504);
      }
    });
  });

  describe("ApiErrorResponse", () => {
    it("accepts a minimal error response with only error string", () => {
      const response: ApiErrorResponse = { error: "Server error" };
      expect(response.error).toBe("Server error");
      expect(response.code).toBeUndefined();
      expect(response.status).toBeUndefined();
    });

    it("accepts a full error response with all fields", () => {
      const response: ApiErrorResponse = {
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        status: 422,
      };
      expect(response.error).toBe("Validation failed");
      expect(response.code).toBe("VALIDATION_ERROR");
      expect(response.status).toBe(422);
    });
  });

  describe("structural completeness", () => {
    it("ApiErrorDetail has exactly 3 fields (message required, code and status optional)", () => {
      const full: ApiErrorDetail = { message: "err", code: "C", status: 500 };
      const keys = Object.keys(full);
      expect(keys).toHaveLength(3);
      expect(keys.sort()).toEqual(["code", "message", "status"]);
    });

    it("ApiErrorResponse has the same shape as ApiErrorDetail but with error instead of message", () => {
      const detail: ApiErrorDetail = { message: "x", code: "C", status: 400 };
      const response: ApiErrorResponse = { error: "x", code: "C", status: 400 };
      expect(Object.keys(detail).sort()).toEqual(["code", "message", "status"]);
      expect(Object.keys(response).sort()).toEqual(["code", "error", "status"]);
    });

    it("ApiSuccess has exactly ok and data fields", () => {
      const success: ApiSuccess<number> = { ok: true, data: 1 };
      expect(Object.keys(success).sort()).toEqual(["data", "ok"]);
    });

    it("ApiError has exactly ok and error fields", () => {
      const error: ApiError = { ok: false, error: { message: "x" } };
      expect(Object.keys(error).sort()).toEqual(["error", "ok"]);
    });
  });

  describe("index re-exports", () => {
    it("exports all expected types", async () => {
      const mod = await import("./index");
      const exportedKeys = Object.keys(mod);
      expect(exportedKeys).toEqual([]);
    });
  });
});
