import { loadFailures } from "./load-failures.mjs";
import { saveFailures } from "./save-failures.mjs";

export function clearProviderFailure(providerName) {
  const failures = loadFailures();
  delete failures[providerName];
  saveFailures(failures);
}
