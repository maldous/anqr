import { recordProviderHealthFailure } from "../symphony-provider-health.mjs";

import { isNeverPurchasedCredits } from "./is-never-purchased-credits.mjs";
import { isTransientProviderFailureType } from "./is-transient-provider-failure-type.mjs";
import { loadFailures } from "./load-failures.mjs";
import { saveFailures } from "./save-failures.mjs";

export function recordProviderFailure(providerName, errorType = "unknown") {
  const failures = loadFailures();
  const text = String(errorType || "");
  const permanentSkip = isNeverPurchasedCredits(text);
  const transient = isTransientProviderFailureType(text);
  failures[providerName] = {
    ts: Math.floor(Date.now() / 1000),
    errorType: text,
    permanentSkip,
    transient,
  };
  saveFailures(failures);
  recordProviderHealthFailure(providerName, text);
}
