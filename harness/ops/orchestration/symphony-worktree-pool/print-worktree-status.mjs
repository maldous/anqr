// Generated from ../../../scripts/ops/orchestration/symphony-worktree-pool.mjs:398

import { getSymphonyWorktrees } from "./get-symphony-worktrees.mjs";
import { listWorktrees } from "./list-worktrees.mjs";

export function printWorktreeStatus() {
  const allWorktrees = listWorktrees();
  const symphonyWorktrees = getSymphonyWorktrees();

  console.log("\n=== Worktree Status ===\n");
  console.log(`Total worktrees: ${allWorktrees.length}`);
  console.log(`Symphony worktrees: ${symphonyWorktrees.length}\n`);

  if (symphonyWorktrees.length > 0) {
    console.log("Symphony worktrees:");
    for (const wt of symphonyWorktrees) {
      const status = wt.prunable ? "⚠️  PRUNABLE" : "✅ OK";
      console.log(`  [${wt.id}] ${status}`);
      console.log(`      Path:   ${wt.path}`);
      console.log(`      Branch: ${wt.branch}`);
      console.log(`      HEAD:   ${wt.head?.slice(0, 12) || "unknown"}`);
      console.log();
    }
  }
}
