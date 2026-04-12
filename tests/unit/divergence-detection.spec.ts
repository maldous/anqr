import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const DETECT_PATH = resolve(
  "harness/ops/orchestration/symphony-worktree-recovery/detect-divergence.mjs",
);
const RECOVERY_CYCLE_PATH = resolve(
  "harness/ops/orchestration/symphony-worktree-recovery/run-recovery-cycle.mjs",
);
const CLASSIFY_PATH = resolve(
  "harness/ops/orchestration/symphony-worktree-recovery/classify-worktree.mjs",
);
const REPAIR_PATH = resolve(
  "harness/ops/orchestration/symphony-worktree-recovery/execute-repair.mjs",
);

describe("divergence detection", () => {
  const detectSource = readFileSync(DETECT_PATH, "utf-8");

  it("checks if origin/main is ancestor of HEAD", () => {
    expect(detectSource).toContain("merge-base");
    expect(detectSource).toContain("--is-ancestor");
    expect(detectSource).toContain("origin/main");
  });

  it("returns false for non-existent or path-less snapshots", () => {
    expect(detectSource).toContain("!snapshot.exists");
    expect(detectSource).toContain("!snapshot.path");
    expect(detectSource).toContain("return false");
  });

  it("uses execFileSync with a timeout", () => {
    expect(detectSource).toContain("execFileSync");
    expect(detectSource).toContain("timeout");
  });

  it("returns true on git failure (diverged)", () => {
    expect(detectSource).toContain("catch");
    expect(detectSource).toContain("return true");
  });
});

describe("recovery cycle divergence integration", () => {
  const cycleSource = readFileSync(RECOVERY_CYCLE_PATH, "utf-8");
  const classifySource = readFileSync(CLASSIFY_PATH, "utf-8");

  it("recovery cycle imports detectDivergence", () => {
    expect(cycleSource).toContain("detectDivergence");
  });

  it("recovery cycle sets snapshot.diverged before classification", () => {
    expect(cycleSource).toContain("snapshot.diverged = detectDivergence");
  });

  it("classify-worktree uses snapshot.diverged for classification", () => {
    expect(classifySource).toContain("snapshot.diverged");
    expect(classifySource).toContain('"diverged"');
  });
});

describe("execute-repair divergence handling", () => {
  const repairSource = readFileSync(REPAIR_PATH, "utf-8");

  it("handles reset_to_main repair action", () => {
    expect(repairSource).toContain("reset_to_main");
  });

  it("uses git reset --hard for divergence repair", () => {
    expect(repairSource).toContain("reset");
    expect(repairSource).toContain("--hard");
    expect(repairSource).toContain("origin/main");
  });
});
