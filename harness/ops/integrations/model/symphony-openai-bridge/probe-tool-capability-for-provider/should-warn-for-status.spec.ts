/// <reference types="vitest" />
import { describe, it, expect } from "vitest";

const { shouldWarnForStatus } = await import("./should-warn-for-status.mjs");

describe("shouldWarnForStatus", () => {
  it("should return true for unknown statuses", () => {
    expect(shouldWarnForStatus("unknown-error")).toBe(true);
    expect(shouldWarnForStatus("rate-limited")).toBe(true);
    expect(shouldWarnForStatus("timeout")).toBe(true);
  });

  it("should return false for non-capable-rejected", () => {
    expect(shouldWarnForStatus("non-capable-rejected")).toBe(false);
  });

  it("should return false for failed-function-call", () => {
    expect(shouldWarnForStatus("failed-function-call")).toBe(false);
  });

  it("should return false for quota-exhausted", () => {
    expect(shouldWarnForStatus("quota-exhausted")).toBe(false);
  });

  it("should return false for auth-invalid", () => {
    expect(shouldWarnForStatus("auth-invalid")).toBe(false);
  });

  it("should return false for unavailable-model", () => {
    expect(shouldWarnForStatus("unavailable-model")).toBe(false);
  });

  it("should return false for bad-request", () => {
    expect(shouldWarnForStatus("bad-request")).toBe(false);
  });
});
