// Generated from ../../../../scripts/ops/integrations/sonar/sonar-linear-sync.mjs:30

import { FETCH_TIMEOUT_MS } from "./fetch-timeout-ms.mjs";

export function fetchWithTimeout(url, headers) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), FETCH_TIMEOUT_MS);
  return fetch(url, { headers, signal: ac.signal }).finally(() => clearTimeout(t));
}
