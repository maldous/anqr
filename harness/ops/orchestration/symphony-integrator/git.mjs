// Generated from ../../../scripts/ops/orchestration/symphony-integrator.mjs:39

import { execFileSync } from "node:child_process";
import { PROJECT_ROOT } from "../../core/worktree-config.mjs";

export function git(...args) {
  return execFileSync("git", args, {
    cwd: PROJECT_ROOT,
    encoding: "utf-8",
    stdio: "pipe",
    timeout: 60_000,
    env: { ...process.env, ANQR_AUTOMATION_PUSH: "1" },
  }).trim();
}
