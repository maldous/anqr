// Generated from ../../../../scripts/ops/integrations/email/email-ingest.mjs:35

import fs from "node:fs";

export function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}
