// Generated runtime carry-forward.

import { log, main } from "./index.mjs";

import { logInfo } from "./logger.mjs";

try {
  await main();
} catch (err) {
  log(`❌ Watchdog error: ${err.message}`);
  process.exit(1);
}
