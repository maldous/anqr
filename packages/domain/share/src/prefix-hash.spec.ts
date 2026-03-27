import { describe, it, expect } from "vitest";
import { prefixHash } from "./prefix-hash";

describe("prefixHash", () => {
  it("should prefix value with hash when value is provided", () => {
    const result = prefixHash("test");
    expect(result).toBe("#test");
  });

  it("should return undefined when value is null", () => {
    const result = prefixHash(null);
    expect(result).toBeUndefined();
  });

  it("should return undefined when value is empty string", () => {
    const result = prefixHash("");
    expect(result).toBeUndefined();
  });

  it("should preserve value content exactly", () => {
    const result = prefixHash("complex-value-123");
    expect(result).toBe("#complex-value-123");
  });

  it("should handle values that already contain hash", () => {
    const result = prefixHash("#already-has-hash");
    expect(result).toBe("##already-has-hash");
  });
});
