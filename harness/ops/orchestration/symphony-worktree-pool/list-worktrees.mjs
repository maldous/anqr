// Generated from ../../../scripts/ops/orchestration/symphony-worktree-pool.mjs:184

import { execFileSync } from "node:child_process";
import { PROJECT_ROOT } from "../../core/worktree-config.mjs";
import { logError } from "./logger.mjs";

export function listWorktrees() {
  try {
    const output = execFileSync("git", ["worktree", "list", "--porcelain"], {
      cwd: PROJECT_ROOT,
      encoding: "utf-8",
    });

    const worktrees = [];
    let current = {};
    for (const line of output.split("\n")) {
      if (line.startsWith("worktree ")) {
        if (current.path) worktrees.push(current);
        current = { path: line.slice(9), prunable: false };
      } else if (line.startsWith("HEAD ")) {
        current.head = line.slice(5);
      } else if (line.startsWith("branch ")) {
        current.branch = line.slice(7).replace("refs/heads/", "");
      } else if (line === "prunable") {
        current.prunable = true;
      }
    }
    if (current.path) worktrees.push(current);

    return worktrees;
  } catch (err) {
    logError(`Failed to list worktrees: ${err.message}`);
    return [];
  }
}
