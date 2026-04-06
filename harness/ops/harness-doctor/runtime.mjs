import { isMain, main } from "./index.mjs";

import { logError } from "./logger.mjs";

if (isMain) {
  await main().catch((err) => {
    logError(`[harness-doctor] Fatal: ${err.message}`);
    process.exit(2);
  });
}
