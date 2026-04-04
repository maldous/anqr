// Generated from ../../../../scripts/ops/integrations/model/symphony-credit-gate.mjs:1461

import { PROBE_RESULT_TTL_MS } from "./probe-result-ttl-ms.mjs";
import { loadProbeResults } from "./load-probe-results.mjs";

export function isRecentlyProbed(providerName) {
  const results = loadProbeResults();
  const entry = results[providerName];
  if (!entry || !entry.ts) return null;
  const age = Date.now() - entry.ts;
  if (age > PROBE_RESULT_TTL_MS) return null;
  return entry;
}
