import path from "node:path";

import { LOCK_DIR } from "./lock-dir.mjs";

export const LOCK_FILE = path.join(LOCK_DIR, "gateway.lock");
