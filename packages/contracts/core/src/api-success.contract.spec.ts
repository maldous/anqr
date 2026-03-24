import { describe, expect, it } from "vitest";
import type { ApiSuccess } from "./api-success.contract";

describe("ApiSuccess", () => {
  it("should validate success structure with string data", () => {
    const success: ApiSuccess<string> = {
      ok: true,
      data: "Success response",
    };

    expect(success.ok).toBe(true);
    expect(success.data).toBe("Success response");
  });

  it("should validate success structure with object data", () => {
    const success: ApiSuccess<{ id: number; name: string }> = {
      ok: true,
      data: { id: 1, name: "Test" },
    };

    expect(success.ok).toBe(true);
    expect(success.data.id).toBe(1);
    expect(success.data.name).toBe("Test");
  });

  it("should validate success structure with array data", () => {
    const success: ApiSuccess<number[]> = {
      ok: true,
      data: [1, 2, 3],
    };

    expect(success.ok).toBe(true);
    expect(success.data).toHaveLength(3);
  });

  it("should have readonly properties", () => {
    const success: ApiSuccess<boolean> = {
      ok: true,
      data: true,
    };

    expect(success.ok).toBe(true);
    expect(success.data).toBe(true);
  });
});
