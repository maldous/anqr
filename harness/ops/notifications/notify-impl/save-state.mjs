import fs from "node:fs";

import { RATE_LIMIT_FILE } from "./rate-limit-file.mjs";
import { STATE_DIR } from "./state-dir.mjs";
import { ensureDir } from "./ensure-dir.mjs";

export function saveState(state) {
  ensureDir(STATE_DIR);
  fs.writeFileSync(RATE_LIMIT_FILE, JSON.stringify(state, null, 2) + "\n");
}
