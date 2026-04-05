import { writeFileSync } from "node:fs";

import { PROBE_RESULTS_FILE } from "./probe-results-file.mjs";
import { ensureStateDir } from "./ensure-state-dir.mjs";
import { isNeverPurchasedCredits } from "./is-never-purchased-credits.mjs";
import { loadProbeResults } from "./load-probe-results.mjs";

export function saveProbeResult(providerName, available, metadata = {}) {
  try {
    ensureStateDir();
    const results = loadProbeResults();
    const detail = metadata.message || metadata.reason || metadata.detail || "";
    results[providerName] = {
      available,
      ts: Date.now(),
      status: metadata.status || null,
      reason: metadata.reason || null,
      message: metadata.message || null,
      detail: metadata.detail || null,
      mode: metadata.mode || null,
      permanentSkip: Boolean(metadata.permanentSkip || isNeverPurchasedCredits(detail)),
    };
    writeFileSync(PROBE_RESULTS_FILE, JSON.stringify(results, null, 2));
  } catch {
    // best-effort — don't block provider selection on cache write failures
  }
}
