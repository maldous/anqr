import { writeFileSync } from "node:fs";

import { PROBE_RESULTS_FILE } from "./probe-results-file.mjs";
import { ensureStateDir } from "./ensure-state-dir.mjs";
import { loadProbeResults } from "./load-probe-results.mjs";

export function saveProbeResult(providerName, available) {
  try {
    ensureStateDir();
    const results = loadProbeResults();
    results[providerName] = { available, ts: Date.now() };
    writeFileSync(PROBE_RESULTS_FILE, JSON.stringify(results, null, 2));
  } catch {
    // best-effort — don't block provider selection on cache write failures
  }
}
