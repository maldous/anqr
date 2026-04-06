import path from "node:path";

import { STATE_DIR } from "./state-dir.mjs";

export const PROBE_CACHE_FILE = path.join(STATE_DIR, "provider-probe-cache.json");
