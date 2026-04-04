// Generated runtime carry-forward.

import { main } from "./index.mjs";

import { logInfo, logWarn, logError } from "./logger.mjs";

main().catch((err) => {
  logError(`Fatal error: ${err?.message || err}`);
  console.error(err);
  process.exit(1);
});
