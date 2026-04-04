// Generated runtime carry-forward.

import { main } from "./index.mjs";

import { logInfo, logError } from "./logger.mjs";

if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}
