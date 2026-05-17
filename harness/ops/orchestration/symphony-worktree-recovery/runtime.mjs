import { runDaemon, runRecoveryCycle, showStatus } from "./index.mjs";

import { logInfo, logError } from "./logger.mjs";

// Check if this module is being executed as the main script
// The parent script (symphony-worktree-recovery.mjs) re-exports this runtime module
const isMainScript =
  process.argv[1]?.endsWith("symphony-worktree-recovery.mjs") ||
  import.meta.url === `file://${process.argv[1]}`;

if (isMainScript) {
  // Ensure we have stderr output
  process.stderr.write("[recovery-runtime] Runtime module loaded\n");
  const mode = process.argv[2];
  process.stderr.write(`[recovery-runtime] Mode: ${mode}\n`);
  if (mode === "once") {
    try {
      const stats = await runRecoveryCycle();
      logInfo(`[recovery] Single cycle: ${JSON.stringify(stats)}`);
      process.exit(stats.errors.length > 0 ? 1 : 0);
    } catch (err) {
      logError(`[recovery] Fatal: ${err.message}`);
      process.exit(1);
    }
  } else if (mode === "daemon") {
    try {
      await runDaemon();
    } catch (err) {
      logError(`[recovery] Fatal: ${err.message}`);
      process.exit(1);
    }
  } else if (mode === "status") {
    showStatus();
  } else {
    console.error("Usage: symphony-worktree-recovery.mjs <once|daemon|status>");
    process.exit(2);
  }
}
