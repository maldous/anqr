import { execFileSync } from "node:child_process";

import { ROOT } from "./root.mjs";
import { getWorkingTreeStatus } from "./get-working-tree-status.mjs";
import { isAllowedDirtyPath } from "./is-allowed-dirty-path.mjs";

export function gitDiffNames() {
  const uncommitted = [
    ...new Set(getWorkingTreeStatus().blocked.map((entry) => entry.file)),
  ];

  // Also detect files changed in local commits (agent may self-commit).
  // git status --porcelain only shows uncommitted changes, so a helpful
  // agent that runs git commit would produce a clean working tree while
  // real changes sit in local commits ahead of origin/main.
  // Filter through isAllowedDirtyPath for parity with the uncommitted path.
  try {
    const committedDiff = execFileSync(
      "git",
      ["diff", "origin/main..HEAD", "--name-only"],
      { cwd: ROOT, encoding: "utf-8" },
    )
      .trim()
      .split("\n")
      .filter(Boolean)
      .filter((f) => !isAllowedDirtyPath(f));
    return [...new Set([...uncommitted, ...committedDiff])];
  } catch {
    return uncommitted;
  }
}
