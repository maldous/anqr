// Generated runtime carry-forward.

import {
  cleanupWorktreePool,
  initWorktreePool,
  listWorktrees,
  printWorktreeStatus,
  repairWorktrees,
} from "./index.mjs";

import { logError } from "./logger.mjs";

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const cmd = args[0];

  try {
    if (cmd === "init") {
      const count = Number(args[1]) || 2;
      await initWorktreePool(count);
    } else if (cmd === "cleanup") {
      await cleanupWorktreePool();
    } else if (cmd === "list") {
      const worktrees = listWorktrees();
      console.log(JSON.stringify(worktrees, null, 2));
    } else if (cmd === "status") {
      printWorktreeStatus();
    } else if (cmd === "repair") {
      await repairWorktrees();
    } else {
      console.error("Usage: symphony-worktree-pool.mjs <command> [args]");
      console.error("");
      console.error("Commands:");
      console.error("  init [count]   - Create worktree pool (default: 2 worktrees)");
      console.error("  cleanup        - Remove all Symphony worktrees");
      console.error("  list           - List all worktrees (JSON output)");
      console.error("  status         - Show worktree status (human-readable)");
      console.error("  repair         - Repair corrupted worktrees");
      process.exit(2);
    }
  } catch (err) {
    logError(`Command failed: ${err.message}`);
    process.exit(1);
  }
}
