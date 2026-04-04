// Generated from ../../../scripts/ops/lib/notify.mjs:24

import fs from "node:fs";

export function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}
