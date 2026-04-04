// Generated runtime carry-forward.

import { API_KEY, isMain, main } from "./index.mjs";

import { logError } from "./logger.mjs";

if (!API_KEY) {
  logError("Error: LINEAR_API_KEY environment variable is required");
  logError("Usage: LINEAR_API_KEY=your_key node scripts/ops/linear-all.mjs");
  process.exit(1);
}

if (isMain) {
  await main().catch((err) => {
    logError(err);
    process.exit(1);
  });
}
