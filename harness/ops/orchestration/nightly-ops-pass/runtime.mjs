import { main } from "./index.mjs";

import { logError } from "./logger.mjs";

try {
  await main();
} catch (err) {
  logError(`[nightly] Fatal: ${err.message}`);
  process.exit(1);
}
