// Generated runtime carry-forward.

import { runDaemon, runRecoveryCycle, showStatus } from "./index.mjs";

import { logInfo, logError } from "./logger.mjs";

if (import.meta.url === `file://${process.argv[1]}`) {
  const mode = process.argv[2];
  if (mode === "once") {
    runRecoveryCycle()
      .then((stats) => {
        logInfo(`[recovery] Single cycle: ${JSON.stringify(stats)}`);
        process.exit(stats.errors.length > 0 ? 1 : 0);
      })
      .catch((err) => {
        logError(`[recovery] Fatal: ${err.message}`);
        process.exit(1);
      });
  } else if (mode === "daemon") {
    runDaemon().catch((err) => {
      logError(`[recovery] Fatal: ${err.message}`);
      process.exit(1);
    });
  } else if (mode === "status") {
    showStatus();
  } else {
    console.error("Usage: symphony-worktree-recovery.mjs <once|daemon|status>");
    process.exit(2);
  }
}
