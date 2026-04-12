import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const DETECT_PATH = resolve(
  "harness/ops/orchestration/symphony-worktree-recovery/detect-divergence.mjs",
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

describe("classify-worktree divergence integration", () => {
  const classifySource = readFileSync(CLASSIFY_PATH, "utf-8");

  it("imports detectDivergence", () => {
    expect(classifySource).toContain("detectDivergence");
  });

  it("classifies diverged worktrees", () => {
    expect(classifySource).toContain("diverged");
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
