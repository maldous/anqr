
import { mode, processQueue, runDaemon, showStatus } from "./index.mjs";

import { logInfo, logError } from "./logger.mjs";

if (mode === "once") {
  processQueue()
    .then((result) => {
      logInfo(`[integrator] Processed ${result.processed} candidate(s)`);
      process.exit(0);
    })
    .catch((err) => {
      logError(`[integrator] Fatal: ${err.message}`);
      process.exit(1);
    });
} else if (mode === "daemon") {
  runDaemon().catch((err) => {
    logError(`[integrator] Fatal: ${err.message}`);
    process.exit(1);
  });
} else if (mode === "status") {
  showStatus();
} else {
  console.error("Usage: symphony-integrator.mjs <once|daemon|status>");
  process.exit(2);
}
