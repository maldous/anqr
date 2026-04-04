import { resolve } from "node:path";

import { PROJECT_ROOT } from "./project-root.mjs";

export const EVIDENCE_DIR = resolve(PROJECT_ROOT, "docs", "harness", "evidence");
