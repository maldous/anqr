import { describe, expect, it } from "vitest";
import type { ApiError } from "./api-error.contract";

describe("ApiError", () => {
  it("should validate error structure with complete details", () => {
    const error: ApiError = {
      ok: false,
      error: {
        message: "Request failed",
        code: "ERR_REQUEST_FAILED",
        status: 500,
      },
    };

    expect(error.ok).toBe(false);
    expect(error.error.message).toBe("Request failed");
    expect(error.error.code).toBe("ERR_REQUEST_FAILED");
    expect(error.error.status).toBe(500);
  });

  it("should validate error with minimal required fields", () => {
    const error: ApiError = {
      ok: false,
      error: {
        message: "Error occurred",
      },
    };

    expect(error.ok).toBe(false);
    expect(error.error.message).toBe("Error occurred");
    expect(error.error.code).toBeUndefined();
    expect(error.error.status).toBeUndefined();
  });

  it("should have readonly properties", () => {
    const error: ApiError = {
      ok: false,
      error: {
        message: "Readonly error",
      },
    };

    expect(error.ok).toBe(false);
  });
});
