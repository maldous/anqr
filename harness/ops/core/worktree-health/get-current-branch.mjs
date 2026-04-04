// Generated from ../../../scripts/ops/core/worktree-health.mjs:65

import { execFileSync } from "node:child_process";

export function getCurrentBranch(worktreePath) {
  try {
    return execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
      cwd: worktreePath,
      encoding: "utf-8",
      timeout: 5_000,
    }).trim();
  } catch {
    return "unknown";
  }
}
