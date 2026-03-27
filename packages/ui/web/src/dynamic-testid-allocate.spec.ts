import { describe, it, expect, beforeEach } from "vitest";
import { allocateUniqueId } from "./dynamic-testid-allocate";

describe("allocateUniqueId", () => {
  beforeEach(() => {
    // Clear the global registry between tests
    const bag = globalThis as Record<string, unknown>;
    delete bag["__ANQR_DYNAMIC_TESTID_REGISTRY__"];
  });

  it("should return base id for first allocation", () => {
    const result = allocateUniqueId("button", "source1");
    expect(result).toBe("button");
  });

  it("should return same id for same source key", () => {
    const result1 = allocateUniqueId("button", "source1");
    const result2 = allocateUniqueId("button", "source1");
    expect(result1).toBe(result2);
  });

  it("should increment for different source with same base", () => {
    const result1 = allocateUniqueId("button", "source1");
    const result2 = allocateUniqueId("button", "source2");
    expect(result1).toBe("button");
    expect(result2).toBe("button-2");
  });

  it("should continue incrementing for multiple sources", () => {
    const result1 = allocateUniqueId("button", "source1");
    const result2 = allocateUniqueId("button", "source2");
    const result3 = allocateUniqueId("button", "source3");
    expect(result1).toBe("button");
    expect(result2).toBe("button-2");
    expect(result3).toBe("button-3");
  });

  it("should handle different base ids independently", () => {
    const button1 = allocateUniqueId("button", "source1");
    const input1 = allocateUniqueId("input", "source2");
    const button2 = allocateUniqueId("button", "source3");
    expect(button1).toBe("button");
    expect(input1).toBe("input");
    expect(button2).toBe("button-2");
  });

  it("should return cached id when source key is reused", () => {
    const result1 = allocateUniqueId("button", "source1");
    allocateUniqueId("button", "source2");
    const result3 = allocateUniqueId("button", "source1");
    expect(result1).toBe("button");
    expect(result3).toBe("button");
  });
});
