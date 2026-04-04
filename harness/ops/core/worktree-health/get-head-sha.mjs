// Generated from ../../../scripts/ops/core/worktree-health.mjs:82

import { execFileSync } from "node:child_process";

export function getHeadSha(worktreePath) {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: worktreePath,
      encoding: "utf-8",
      timeout: 5_000,
    }).trim();
  } catch {
    return "unknown";
  }
}
