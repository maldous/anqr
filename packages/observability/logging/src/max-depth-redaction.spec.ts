import { describe, it, expect } from "vitest";
import { maxDepthRedaction } from "./max-depth-redaction";

describe("maxDepthRedaction", () => {
  it("should return null when depth is below max", () => {
    const result = maxDepthRedaction(5);
    expect(result).toBeNull();
  });

  it("should return [MAX_DEPTH] when depth exceeds max", () => {
    // MAX_CONTEXT_DEPTH is typically 10
    const result = maxDepthRedaction(11);
    expect(result).toBe("[MAX_DEPTH]");
  });

  it("should return null at exactly MAX_CONTEXT_DEPTH", () => {
    const result = maxDepthRedaction(10);
    expect(result).toBeNull();
  });

  it("should return [MAX_DEPTH] at MAX_CONTEXT_DEPTH + 1", () => {
    const result = maxDepthRedaction(11);
    expect(result).toBe("[MAX_DEPTH]");
  });

  it("should return null at depth 0", () => {
    const result = maxDepthRedaction(0);
    expect(result).toBeNull();
  });

  it("should return null at depth 1", () => {
    const result = maxDepthRedaction(1);
    expect(result).toBeNull();
  });

  it("should return [MAX_DEPTH] at very large depth", () => {
    const result = maxDepthRedaction(1000);
    expect(result).toBe("[MAX_DEPTH]");
  });
});
