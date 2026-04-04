import { resolve } from "node:path";

import { PROJECT_ROOT } from "./project-root.mjs";

export const EXPORT_PATH = resolve(PROJECT_ROOT, "reports/linear-export/issues-latest.json");
