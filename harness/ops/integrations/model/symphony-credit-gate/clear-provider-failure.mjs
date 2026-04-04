// Generated from ../../../../scripts/ops/integrations/model/symphony-credit-gate.mjs:592

import { loadFailures } from "./load-failures.mjs";
import { saveFailures } from "./save-failures.mjs";

export function clearProviderFailure(providerName) {
  const failures = loadFailures();
  delete failures[providerName];
  saveFailures(failures);
}
