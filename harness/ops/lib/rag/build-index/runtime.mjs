import { main } from "./index.mjs";
import { buildLinearIndex } from "../build-index-linear/build-linear-index.mjs";

import { logInfo, logError } from "./logger.mjs";

try {
  await buildLinearIndex();
} catch (err) {
  logError(`Linear index failed (non-fatal): ${err?.message || err}`);
  logInfo("⚠️  Skipping Linear RAG index — continuing with source-code index");
}

try {
  logInfo("\n🔄 Now building source-code RAG index...\n");
  await main();
} catch (err) {
  logError(`Fatal error: ${err?.message || err}`);
  console.error(err);
  process.exit(1);
}
