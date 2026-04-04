import { resolve } from "node:path";

import { STATE_DIR } from "./state-dir.mjs";

export const PROBE_RESULTS_FILE = resolve(STATE_DIR, "provider-probe-results.json");
