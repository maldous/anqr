// Generated from ../../../scripts/ops/orchestration/symphony-runner.mjs:353

import { execFileSync } from "node:child_process";

import { ROOT } from "./root.mjs";

export function getRepoHeadSha(ref = "HEAD") {
  return execFileSync("git", ["rev-parse", ref], {
    cwd: ROOT,
    encoding: "utf-8",
  }).trim();
}
