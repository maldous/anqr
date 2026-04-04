import { resolve } from "node:path";

import { STATE_DIR } from "./state-dir.mjs";

export const ADAPTIVE_PARAMS_FILE = resolve(STATE_DIR, "adaptive-params.json");
