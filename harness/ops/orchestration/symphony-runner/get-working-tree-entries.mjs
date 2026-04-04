// Generated from ../../../scripts/ops/orchestration/symphony-runner.mjs:243

import { execFileSync } from "node:child_process";

import { ROOT } from "./root.mjs";
import { isAllowedDirtyPath } from "./is-allowed-dirty-path.mjs";
import { normalizeRepoPath } from "./normalize-repo-path.mjs";

export function getWorkingTreeEntries() {
  try {
    const status = execFileSync("git", ["status", "--porcelain"], { cwd: ROOT, encoding: "utf-8" });
    return status
      .split("\n")
      .map((line) => line.trimEnd())
      .filter(Boolean)
      .map((line) => {
        const xy = line.slice(0, 2);
        let file = line.slice(3).trim();
        if (file.includes(" -> ")) file = file.split(" -> ").pop().trim();
        const normalizedPath = normalizeRepoPath(file);
        return { status: xy, file: normalizedPath, allowed: isAllowedDirtyPath(normalizedPath) };
      });
  } catch {
    return [];
  }
}
