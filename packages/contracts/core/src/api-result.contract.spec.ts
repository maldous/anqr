import { describe, expect, it } from "vitest";
import type { ApiResult } from "./api-result.contract";

describe("ApiResult", () => {
  it("should validate success result variant", () => {
    const result: ApiResult<string> = {
      ok: true,
      data: "Success data",
    };

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toBe("Success data");
    }
  });

  it("should validate error result variant", () => {
    const result: ApiResult<string> = {
      ok: false,
      error: {
        message: "Error occurred",
        code: "ERR_001",
        status: 500,
      },
    };

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBe("Error occurred");
    }
  });

  it("should support type narrowing with ok field", () => {
    const successResult: ApiResult<number> = {
      ok: true,
      data: 42,
    };

    const errorResult: ApiResult<number> = {
      ok: false,
      error: {
        message: "Failed",
      },
    };

    if (successResult.ok) {
      expect(successResult.data).toBe(42);
    }

    if (!errorResult.ok) {
      expect(errorResult.error.message).toBe("Failed");
    }
  });
});
