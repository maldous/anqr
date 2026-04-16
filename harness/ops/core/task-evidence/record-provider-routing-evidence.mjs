import { updateEvidenceRecord } from "./update-evidence-record.mjs";

/**
 * Record structured provider routing evidence for a request.
 *
 * Captures the full routing decision chain so operators can reconstruct:
 * - Which route was resolved and what providers were allowed
 * - Which provider was ultimately selected
 * - How many attempts were made and which providers were tried
 * - The full fallback chain with per-attempt outcome, timing, and error details
 *
 * @param {string} correlationId
 * @param {object} evidence
 * @param {string} evidence.routeModelId — the resolved model ID
 * @param {string[]} evidence.allowedProviders — providers allowed by route policy
 * @param {string} evidence.selectedProvider — final selected provider name
 * @param {number} evidence.attempts — total attempt count
 * @param {string[]} evidence.triedProviders — ordered list of providers tried
 * @param {Array<{providerName: string, model?: string, attemptNumber: number, outcome: string, durationMs: number, errorType?: string, errorMessage?: string}>} evidence.fallbackChain — per-attempt structured records
 * @param {Array<{name: string, status: string, reason?: string, tier?: string, score?: number|string, rank?: number|null, selections?: number, toolConfirmed?: boolean}>} [evidence.selectionRationale] — F5: ranked selection log from selectProvider with candidate scores and ranking factors
 */
export function recordProviderRoutingEvidence(correlationId, evidence) {
  return updateEvidenceRecord(correlationId, {
    providerRouting: {
      decidedAt: new Date().toISOString(),
      routeModelId: evidence.routeModelId || null,
      allowedProviders: evidence.allowedProviders || [],
      selectedProvider: evidence.selectedProvider || null,
      attempts: evidence.attempts || 1,
      triedProviders: evidence.triedProviders || [],
      hasFallback: (evidence.attempts || 1) > 1,
      fallbackChain: (evidence.fallbackChain || []).map((entry) => ({
        providerName: entry.providerName,
        model: entry.model || null,
        attemptNumber: entry.attemptNumber,
        outcome: entry.outcome,
        durationMs: entry.durationMs || 0,
        errorType: entry.errorType || null,
        errorMessage: entry.errorMessage || null,
      })),
      selectionRationale: evidence.selectionRationale || null,
    },
  });
}
