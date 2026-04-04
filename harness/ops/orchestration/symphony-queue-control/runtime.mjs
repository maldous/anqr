// Generated runtime carry-forward.

import { fileURLToPath } from "node:url";

import { main } from "./index.mjs";

import { logInfo, logError } from "./logger.mjs";

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    await main();
  } catch (err) {
    logError(`[queue-control] Fatal: ${err.message}`);
    process.exit(1);
  }
}
