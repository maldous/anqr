import { isNeverPurchasedCredits } from "./is-never-purchased-credits.mjs";

const HARD_SKIP_STATUSES = new Set(["auth_missing", "auth_invalid"]);

export function shouldSkipProviderFromCache(entry) {
  if (!entry) return false;
  return HARD_SKIP_STATUSES.has(entry.status) || isNeverPurchasedCredits(entry);
}
