import { updateEvidenceRecord } from "./update-evidence-record.mjs";

/**
 * Record safety-net activation evidence when all providers are exhausted.
 *
 * This is a critical event: the request could not be served by any configured
 * provider. The evidence record captures the full context for incident review.
 *
 * @param {string} correlationId
 * @param {object} evidence
 * @param {string[]} evidence.triedProviders — ordered list of attempted providers
 * @param {string} evidence.routeModelId — the model route that was attempted
 * @param {string|null} evidence.lastError — last error message before exhaustion
 * @param {number|null} evidence.contextBudgetCap — final context budget cap (if reduced)
 * @param {Array<object>} evidence.fallbackChain — per-attempt records
 */
export function recordSafetyNetEvidence(correlationId, evidence) {
  if (!correlationId) return;
  return updateEvidenceRecord(correlationId, {
    safetyNet: {
      activatedAt: new Date().toISOString(),
      exhausted: true,
      triedProviders: evidence.triedProviders || [],
      totalAttempts: evidence.triedProviders?.length || 0,
      routeModelId: evidence.routeModelId || null,
      lastError: (evidence.lastError || "").slice(0, 500),
      finalContextBudgetCap: evidence.contextBudgetCap ?? null,
      fallbackChain: (evidence.fallbackChain || []).map((entry) => ({
        providerName: entry.providerName,
        outcome: entry.outcome,
        durationMs: entry.durationMs,
        errorType: entry.errorType || null,
      })),
    },
  });
}
