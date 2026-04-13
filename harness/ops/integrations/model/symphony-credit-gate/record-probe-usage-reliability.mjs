import { loadStats } from "./load-stats.mjs";

/**
 * Compute the probe-vs-usage reliability ratio for a provider.
 *
 * This is the SINGLE source of truth for reliability computation.
 *
 * Returns a value between 0 and 1 where:
 *   1.0 = every selection resulted in success
 *   0.5 = neutral (no real usage data yet)
 *   0.0 = every selection resulted in failure
 *
 * The "probe-only success" (probe succeeds but usage fails) is derived:
 *   probeOnlySuccesses = selections - usageSuccesses - usageFailures
 * This avoids double-counting since we only track real usage outcomes.
 */
export function getProbeUsageReliability(providerName, stats) {
  // Allow passing pre-loaded stats to avoid re-reading the file
  const s = stats || loadStats();
  const usageSuc = s.usageSuccesses?.[providerName] || 0;
  const usageFail = s.usageFailures?.[providerName] || 0;
  const selections = s.selections?.[providerName] || 0;
  const totalRealUsage = usageSuc + usageFail;

  // If no real usage data, neutral score
  if (totalRealUsage === 0) return 0.5;

  // High real usage success rate is good
  const usageSuccessRate = usageSuc / totalRealUsage;

  // If there are selections with no recorded usage outcome, those are
  // "probe-only successes" — the provider was selected but we don't know
  // if usage succeeded or failed. Weight them neutrally.
  const untracked = selections - totalRealUsage;
  if (untracked > 0) {
    // Blend: known outcomes + neutral for unknowns
    return (usageSuc + untracked * 0.5) / selections;
  }

  return usageSuccessRate;
}
