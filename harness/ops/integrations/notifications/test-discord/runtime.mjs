import { runTests } from "./index.mjs";

import { logError } from "./logger.mjs";

try {
  await runTests();
} catch (err) {
  logError(`❌ Test error: ${err.message}`);
  process.exit(1);
}
