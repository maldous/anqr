export function hasDurableProviderAccessFailure(entry) {
  const haystack = [entry?.status, entry?.reason, entry?.detail, entry?.message]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return (
    haystack.includes("never purchased credits") ||
    haystack.includes("payment required") ||
    haystack.includes("positive credit balance is required") ||
    haystack.includes("credit limit exceeded") ||
    haystack.includes("forbidden") ||
    haystack.includes("unauthorized") ||
    haystack.includes("invalid api key") ||
    haystack.includes("auth_invalid")
    // NOTE: quota_exhausted is NOT durable — it may recover on its own.
    // Stale quota (>24h) is handled by isStaleQuotaExhausted in shouldSkipProviderFromCache.
    // Fresh quota (<24h) should NOT be hard-skipped so the provider can recover.
  );
}
