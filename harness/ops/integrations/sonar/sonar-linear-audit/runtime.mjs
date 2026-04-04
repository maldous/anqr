// Generated runtime carry-forward.

import { main } from "./index.mjs";

import { logError } from "./logger.mjs";

try {
  await main();
} catch (err) {
  logError(`[sonar-audit] Fatal: ${err.message}`);
  process.exit(2);
}
