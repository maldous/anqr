import { readFileSync, existsSync } from "node:fs";

import { PROBE_RESULTS_FILE } from "./probe-results-file.mjs";

export function loadProbeResults() {
  try {
    if (existsSync(PROBE_RESULTS_FILE)) {
      return JSON.parse(readFileSync(PROBE_RESULTS_FILE, "utf-8"));
    }
  } catch {}
  return {};
}
