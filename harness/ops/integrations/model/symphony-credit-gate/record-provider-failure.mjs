import { recordProviderHealthFailure } from "../symphony-provider-health.mjs";

import { loadFailures } from "./load-failures.mjs";
import { providerGatewayKey } from "./provider-gateway-key.mjs";
import { saveFailures } from "./save-failures.mjs";
import { isTransientProviderFailureType } from "./is-transient-provider-failure-type.mjs";

export function recordProviderFailure(providerName, errorType = "unknown") {
  const failures = loadFailures();
  const failedAt = Math.floor(Date.now() / 1000);
  const gatewayKey = providerGatewayKey({ name: providerName });
  if (isTransientProviderFailureType(errorType)) {
    failures[providerName] = { failedAt, errorType };
    failures[gatewayKey] = { failedAt, errorType };
  } else {
    delete failures[providerName];
    delete failures[gatewayKey];
  }
  saveFailures(failures);
  recordProviderHealthFailure(providerName, errorType);
  if (gatewayKey !== providerName) recordProviderHealthFailure(gatewayKey, errorType);
}
