// Generated from ../../../scripts/ops/orchestration/symphony-runner.mjs:329

import { execFileSync } from "node:child_process";

import { ROOT } from "./root.mjs";
import { gitDiffNames } from "./git-diff-names.mjs";

export function gitDiffStat() {
  try {
    const files = gitDiffNames();
    if (files.length === 0) return "";
    return execFileSync("git", ["diff", "--stat", "--", ...files], {
      cwd: ROOT,
      encoding: "utf-8",
    }).trim();
  } catch {
    return "";
  }
}
