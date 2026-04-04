import { resolve } from "node:path";

import { STATE_DIR } from "./state-dir.mjs";

export const SESSION_STATE_FILE = resolve(STATE_DIR, "session-state.json");
