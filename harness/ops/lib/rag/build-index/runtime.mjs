// Generated runtime carry-forward.

import { main } from "./index.mjs";
import { buildLinearIndex } from "../build-index-linear/build-linear-index.mjs";

import { logInfo, logError } from "./logger.mjs";

main()
  .then(() => {
    logInfo("\n🔄 Now building Linear RAG index...\n");
    return buildLinearIndex();
  })
  .catch((err) => {
    logError(`Fatal error: ${err?.message || err}`);
    console.error(err);
    process.exit(1);
  });
