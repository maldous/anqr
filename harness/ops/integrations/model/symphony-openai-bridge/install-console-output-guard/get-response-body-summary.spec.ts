/// <reference types="vitest" />
import { describe, it, expect } from "vitest";

const { getResponseBodySummary } = await import("./get-response-body-summary.mjs");

describe("getResponseBodySummary", () => {
  it("should trim string response bodies", () => {
    const long = "a".repeat(500);
    const result = getResponseBodySummary(long);
    expect(result.length).toBeLessThan(310);
  });

  it("should return keys from object response bodies", () => {
    const result = getResponseBodySummary({ userId: 1, action: "test", data: {} }) as Record<string, unknown>;
    expect(result.keys).toEqual(["userId", "action", "data"]);
  });

  it("should return undefined for non-string, non-object bodies", () => {
    expect(getResponseBodySummary(null)).toBeUndefined();
    expect(getResponseBodySummary(undefined)).toBeUndefined();
    expect(getResponseBodySummary(42)).toBeUndefined();
  });
});
