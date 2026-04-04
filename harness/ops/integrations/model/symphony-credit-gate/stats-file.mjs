import { resolve } from "node:path";

import { STATE_DIR } from "./state-dir.mjs";

export const STATS_FILE = resolve(STATE_DIR, "provider-stats.json");
