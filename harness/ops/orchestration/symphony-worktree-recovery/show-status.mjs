// Generated from ../../../scripts/ops/orchestration/symphony-worktree-recovery.mjs:662

import { getFleetInventory } from "../../core/worktree-health.mjs";

import { classifyWorktree } from "./classify-worktree.mjs";

export function showStatus() {
  const inventory = getFleetInventory();
  console.log("\n=== Worktree Recovery Status ===");
  console.log(`Timestamp: ${inventory.timestamp}`);
  console.log(`Summary: ${JSON.stringify(inventory.summary)}`);
  console.log();

  for (const wt of inventory.worktrees) {
    const classification = classifyWorktree(wt);
    console.log(
      `  ${wt.id}: ${wt.classification} → ${classification.repairAction || "none"} (confidence: ${classification.confidence})`,
    );
    if (wt.issueIdentifier) console.log(`    Issue: ${wt.issueIdentifier}`);
    if (wt.gitDirtyFiles.length > 0) console.log(`    Dirty files: ${wt.gitDirtyFiles.length}`);
  }
  console.log();
}
