import { buildLinearIndex } from "./index.mjs";

import { logError } from "./logger.mjs";

try {
  await buildLinearIndex();
} catch (err) {
  logError(`Fatal error: ${err?.message || err}`);
  console.error(err);
  process.exit(1);
}
