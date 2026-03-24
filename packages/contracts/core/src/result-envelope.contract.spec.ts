import { describe, expect, it } from "vitest";
import type { ApiError, ApiErrorDetail, ApiResult, ApiSuccess } from "./result-envelope.contract";

describe("Result Envelope Contracts", () => {
  it("should validate ApiSuccess structure", () => {
    const success: ApiSuccess<string> = {
      ok: true,
      data: "test data",
    };

    expect(success.ok).toBe(true);
    expect(success.data).toBe("test data");
  });

  it("should validate ApiError structure", () => {
    const error: ApiError = {
      ok: false,
      error: {
        message: "Something went wrong",
        code: "ERR_001",
        status: 500,
      },
    };

    expect(error.ok).toBe(false);
    expect(error.error.message).toBe("Something went wrong");
  });

  it("should validate ApiResult as union type", () => {
    const successResult: ApiResult<number> = {
      ok: true,
      data: 42,
    };

    const errorResult: ApiResult<number> = {
      ok: false,
      error: {
        message: "Error occurred",
      },
    };

    expect(successResult.ok).toBe(true);
    expect(errorResult.ok).toBe(false);
  });

  it("should validate ApiErrorDetail with optional fields", () => {
    const minimal: ApiErrorDetail = {
      message: "Error message",
    };

    const full: ApiErrorDetail = {
      message: "Error message",
      code: "ERR_CODE",
      status: 404,
    };

    expect(minimal.message).toBe("Error message");
    expect(full.code).toBe("ERR_CODE");
    expect(full.status).toBe(404);
  });
});
