import { existsSync, mkdirSync } from "node:fs";

import { STATE_DIR } from "./state-dir.mjs";

export function ensureRuntimeStateDir() {
  if (!existsSync(STATE_DIR)) mkdirSync(STATE_DIR, { recursive: true, mode: 0o700 });
}
