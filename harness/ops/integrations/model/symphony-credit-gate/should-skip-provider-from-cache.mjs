import { hasDurableProviderAccessFailure } from "./has-durable-provider-access-failure.mjs";

const HARD_SKIP_STATUSES = new Set(["auth_missing", "auth_invalid", "quota_exhausted"]);

export function shouldSkipProviderFromCache(entry) {
  if (!entry) return false;
  return HARD_SKIP_STATUSES.has(entry.status) || hasDurableProviderAccessFailure(entry);
}
