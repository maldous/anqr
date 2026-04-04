// Generated from ../../../scripts/ops/notifications/notify-impl.mjs:24

import fs from "node:fs";

export function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}
