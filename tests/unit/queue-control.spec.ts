import { describe, it, expect } from "vitest";

describe("symphony-queue-control MAX_CONCURRENT_AGENTS validation", () => {
  it("should export countEnabledTimers function", async () => {
    const { countEnabledTimers } =
      // @ts-ignore - No type declarations for .mjs module
      await import("../../harness/ops/orchestration/symphony-queue-control.mjs");

    expect(typeof countEnabledTimers).toBe("function");
  });

  it("should export validateConcurrencyConfig function", async () => {
    const { validateConcurrencyConfig } =
      // @ts-ignore - No type declarations for .mjs module
      await import("../../harness/ops/orchestration/symphony-queue-control.mjs");

    expect(typeof validateConcurrencyConfig).toBe("function");
  });

  it("should export getQueueSnapshot function", async () => {
    const { getQueueSnapshot } =
      // @ts-ignore - No type declarations for .mjs module
      await import("../../harness/ops/orchestration/symphony-queue-control.mjs");

    expect(typeof getQueueSnapshot).toBe("function");
  });
});
