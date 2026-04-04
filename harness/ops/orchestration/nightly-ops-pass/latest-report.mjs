import { resolve } from "node:path";

import { REPORTS_DIR } from "./reports-dir.mjs";

export const LATEST_REPORT = resolve(REPORTS_DIR, "latest.json");
