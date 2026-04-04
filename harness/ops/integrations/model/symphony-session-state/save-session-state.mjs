import { writeFileSync } from "node:fs";

import { SESSION_STATE_FILE } from "./session-state-file.mjs";
import { ensureStateDir } from "./ensure-state-dir.mjs";

export function saveSessionState(state) {
  ensureStateDir();
  writeFileSync(SESSION_STATE_FILE, JSON.stringify(state, null, 2));
}
