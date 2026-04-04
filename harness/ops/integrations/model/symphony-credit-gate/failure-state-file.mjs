import { resolve } from "node:path";

import { STATE_DIR } from "./state-dir.mjs";

export const FAILURE_STATE_FILE = resolve(STATE_DIR, "provider-failures.json");
