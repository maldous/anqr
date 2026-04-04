import { readFileSync, existsSync } from "node:fs";

import { PROVIDER_STATS } from "./provider-stats.mjs";
import { STATS_FILE } from "./stats-file.mjs";

export function loadStats() {
  try {
    if (existsSync(STATS_FILE)) {
      const data = JSON.parse(readFileSync(STATS_FILE, "utf-8"));
      // Merge with defaults to handle new fields
      return { ...PROVIDER_STATS, ...data };
    }
  } catch {}
  return { ...PROVIDER_STATS };
}
