/// <reference types="vitest" />
import { describe, it, expect } from "vitest";

const { classifyBucket } = await import("./classify-bucket.mjs");

describe("classifyBucket", () => {
  it("should classify dirty_owned as dirty", () => {
    expect(classifyBucket("dirty_owned", {})).toBe("dirty");
  });

  it("should classify dirty_orphaned as dirty", () => {
    expect(classifyBucket("dirty_orphaned", {})).toBe("dirty");
  });

  it("should return the state when it exists in summary", () => {
    expect(classifyBucket("active", { active: 3 })).toBe("active");
  });

  it("should return unknown when state is not in summary", () => {
    expect(classifyBucket("unknown_state", { active: 3 })).toBe("unknown");
  });
});
