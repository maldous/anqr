// Generated runtime carry-forward.

import { buildLinearIndex } from "./index.mjs";

import { logInfo, logWarn, logError } from "./logger.mjs";

buildLinearIndex().catch((err) => {
  logError(`Fatal error: ${err?.message || err}`);
  console.error(err);
  process.exit(1);
});
