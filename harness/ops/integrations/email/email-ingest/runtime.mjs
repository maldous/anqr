import { fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";

import { REPORTS_DIR, ensureDir, main } from "./index.mjs";

import { logError } from "./logger.mjs";

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    await main();
  } catch (err) {
    logError(`[email-ingest] Fatal: ${err.message}`);
    const failure = { ok: false, error: err.message, at: new Date().toISOString() };
    ensureDir(REPORTS_DIR);
    fs.writeFileSync(
      path.join(REPORTS_DIR, "latest.json"),
      JSON.stringify(failure, null, 2) + "\n",
    );
    process.exit(1);
  }
}
