import { resolve } from "node:path";

import { PROJECT_ROOT } from "./project-root.mjs";

export const STATE_DIR = resolve(PROJECT_ROOT, "reports", "symphony");
