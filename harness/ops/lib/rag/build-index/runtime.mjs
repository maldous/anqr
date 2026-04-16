import { main } from "./index.mjs";
import { buildLinearIndex } from "../build-index-linear/build-linear-index.mjs";

import { logInfo, logError } from "./logger.mjs";

// Linear index is best-effort — if the export file is missing (e.g. the
// linear-export timer hasn't run yet), log a warning and continue to the
// source-code index which is the primary deliverable.
buildLinearIndex()
  .catch((err) => {
    logError(`Linear index failed (non-fatal): ${err?.message || err}`);
    logInfo("⚠️  Skipping Linear RAG index — continuing with source-code index");
  })
  .then(() => {
    logInfo("\n🔄 Now building source-code RAG index...\n");
    return main();
  })
  .catch((err) => {
    logError(`Fatal error: ${err?.message || err}`);
    console.error(err);
    process.exit(1);
  });
