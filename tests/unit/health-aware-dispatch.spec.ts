import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

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

describe("selectLinearWorktree health-aware dispatch", () => {
  const source = readFileSync(
    resolve("harness/ops/integrations/model/symphony-agent-router/select-linear-worktree.mjs"),
    "utf-8",
  );

  it("filters out quarantined worktrees", () => {
    expect(source).toContain("quarantined");
  });

  it("filters out diverged worktrees", () => {
    expect(source).toContain("diverged");
  });

  it("filters out unavailable worktrees", () => {
    expect(source).toContain("unavailable");
  });

  it("uses UNHEALTHY_STATES set for filtering", () => {
    expect(source).toContain("UNHEALTHY_STATES");
  });

  it("imports getWorktreeState for health checks", () => {
    expect(source).toContain("getWorktreeState");
  });

  it("returns null when no healthy worktrees are available", () => {
    expect(source).toContain("if (healthy.length === 0) return null");
  });
});
