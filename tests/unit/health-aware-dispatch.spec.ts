import { describe, it, expect } from "vitest";

import { getHealthyLinearCapacity } from "../../harness/ops/orchestration/linear-reconciler/get-healthy-linear-capacity.mjs";

describe("getHealthyLinearCapacity", () => {
  it("returns capacity for Linear worktrees (wt1-wt4)", () => {
    const result = getHealthyLinearCapacity();

    expect(result.total).toBe(4);
    expect(result.healthy).toBeGreaterThanOrEqual(0);
    expect(result.healthy).toBeLessThanOrEqual(4);
    expect(result.available).toBeLessThanOrEqual(result.healthy);
    expect(result.executing).toBeLessThanOrEqual(result.healthy);
    expect(result.healthy + result.unhealthy).toBe(4);
    expect(result.worktrees).toHaveLength(4);
  });

  it("worktree entries have required fields", () => {
    const result = getHealthyLinearCapacity();

    for (const wt of result.worktrees) {
      expect(wt.id).toBeGreaterThanOrEqual(1);
      expect(wt.id).toBeLessThanOrEqual(4);
      expect(wt.wtId).toMatch(/^wt[1-4]$/);
      expect(typeof wt.state).toBe("string");
      expect(typeof wt.healthy).toBe("boolean");
      expect(typeof wt.executing).toBe("boolean");
    }
  });
});
