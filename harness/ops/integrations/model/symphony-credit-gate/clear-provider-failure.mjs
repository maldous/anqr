import { loadFailures } from "./load-failures.mjs";
import { providerGatewayKey } from "./provider-gateway-key.mjs";
import { saveFailures } from "./save-failures.mjs";

export function clearProviderFailure(providerName) {
  const failures = loadFailures();
  delete failures[providerName];
  delete failures[providerGatewayKey({ name: providerName })];
  saveFailures(failures);
}
