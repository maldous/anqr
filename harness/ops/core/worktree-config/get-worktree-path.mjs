import { resolve } from "node:path";

import { PROJECT_ROOT } from "./project-root.mjs";
import { WORKTREE_PREFIX } from "./worktree-prefix.mjs";

export function getWorktreePath(id) {
  if (!id) {
    throw new Error("Worktree ID is required");
  }
  return resolve(PROJECT_ROOT, "..", `${WORKTREE_PREFIX}${id}`);
}
