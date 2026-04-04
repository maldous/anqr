// Generated from ../../../../scripts/ops/integrations/model/symphony-credit-gate.mjs:584

import { recordProviderHealthFailure } from "../symphony-provider-health.mjs";

import { loadFailures } from "./load-failures.mjs";
import { saveFailures } from "./save-failures.mjs";

export function recordProviderFailure(providerName, errorType = "unknown") {
  const failures = loadFailures();
  failures[providerName] = Math.floor(Date.now() / 1000);
  saveFailures(failures);
  // Update health state tracking
  recordProviderHealthFailure(providerName, errorType);
}
