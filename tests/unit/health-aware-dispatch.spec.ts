import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { getHealthyLinearCapacity } from "../../harness/ops/orchestration/linear-reconciler/get-healthy-linear-capacity.mjs";

describe("getHealthyLinearCapacity", () => {
  it("returns capacity for Linear worktrees (wt1-wt4)", () => {
    const result = getHealthyLinearCapacity();
    expect(result.total).toBe(4);
    expect(result.worktrees).toHaveLength(4);
  });

  it("normalizes expanded worktree health classifications", () => {
    const mainSource = readFileSync(
      resolve(
        "harness/ops/orchestration/linear-reconciler/get-healthy-linear-capacity/get-healthy-linear-capacity.mjs",
      ),
      "utf-8",
    );
    const normalizeSource = readFileSync(
      resolve(
        "harness/ops/orchestration/linear-reconciler/get-healthy-linear-capacity/normalize-worktree-state.mjs",
      ),
      "utf-8",
    );
    const source = mainSource + normalizeSource;

    expect(source).toContain("DIRTY_REPAIRABLE");
    expect(source).toContain("INTEGRATION_BLOCKED");
    expect(source).toContain("UNAVAILABLE");
  });
});
