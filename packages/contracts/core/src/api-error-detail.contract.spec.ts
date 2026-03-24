import { describe, expect, it } from "vitest";
import type { ApiErrorDetail } from "./api-error-detail.contract";

describe("ApiErrorDetail", () => {
  it("should validate complete error detail structure", () => {
    const detail: ApiErrorDetail = {
      message: "Detailed error message",
      code: "ERR_DETAIL_001",
      status: 400,
    };

    expect(detail.message).toBe("Detailed error message");
    expect(detail.code).toBe("ERR_DETAIL_001");
    expect(detail.status).toBe(400);
  });

  it("should validate minimal error detail with only message", () => {
    const detail: ApiErrorDetail = {
      message: "Simple error",
    };

    expect(detail.message).toBe("Simple error");
    expect(detail.code).toBeUndefined();
    expect(detail.status).toBeUndefined();
  });

  it("should have readonly message property", () => {
    const detail: ApiErrorDetail = {
      message: "Readonly message",
      code: "CODE",
      status: 500,
    };

    expect(detail.message).toBe("Readonly message");
  });
});
