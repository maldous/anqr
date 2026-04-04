import { writeFileSync } from "node:fs";

import { STATS_FILE } from "./stats-file.mjs";
import { ensureStateDir } from "./ensure-state-dir.mjs";

export function saveStats(stats) {
  ensureStateDir();
  writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
}
