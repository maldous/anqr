import { WORKTREE_PREFIX, WORKTREE_BRANCH_PREFIX } from "../../core/worktree-config.mjs";

import { listWorktrees } from "./list-worktrees.mjs";
import { logDebug } from "./logger.mjs";

export function getSymphonyWorktrees() {
  const allWorktrees = listWorktrees();
  logDebug(`[worktree-pool] getSymphonyWorktrees() - total worktrees: ${allWorktrees.length}`);

  const filtered = allWorktrees.filter(
    (wt) => wt.path.includes(WORKTREE_PREFIX) && wt.branch?.startsWith(WORKTREE_BRANCH_PREFIX),
  );

  logDebug(`[worktree-pool] Worktrees matching Symphony pattern: ${filtered.length}`);

  const result = filtered
    .map((wt) => {
      const match = wt.path.match(new RegExp(`${WORKTREE_PREFIX}(\\d+)`));
      const id = match ? Number(match[1]) : null;
      logDebug(`[worktree-pool] Mapped worktree: path=${wt.path}, id=${id}`);
      return {
        id,
        ...wt,
      };
    })
    .filter((wt) => wt.id !== null);

  logDebug(`[worktree-pool] Final Symphony worktrees count: ${result.length}`);
  return result;
}
