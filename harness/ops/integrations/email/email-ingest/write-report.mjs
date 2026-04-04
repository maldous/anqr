// Generated from ../../../../scripts/ops/integrations/email/email-ingest.mjs:303

import fs from "node:fs";
import path from "node:path";

import { REPORTS_DIR } from "./reports-dir.mjs";
import { ensureDir } from "./ensure-dir.mjs";

export function writeReport(summary) {
  ensureDir(REPORTS_DIR);
  fs.writeFileSync(path.join(REPORTS_DIR, "latest.json"), JSON.stringify(summary, null, 2) + "\n");
}
