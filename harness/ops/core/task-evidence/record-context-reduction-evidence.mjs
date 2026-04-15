import { updateEvidenceRecord } from "./update-evidence-record.mjs";

/**
 * Record context-reduction evidence for a request.
 *
 * Captures every context budget adjustment that occurred during the
 * provider fallback cascade, linking adaptive context decisions to
 * the request evidence record for post-hoc analysis.
 *
 * @param {string} correlationId
 * @param {Array<{providerName: string, previousCap: number|null, newCap: number, reason: string, reportedLimit?: number, requestedTokens?: number}>} reductions
 */
export function recordContextReductionEvidence(correlationId, reductions) {
  if (!correlationId || !reductions || reductions.length === 0) return;
  return updateEvidenceRecord(correlationId, {
    contextReduction: {
      recordedAt: new Date().toISOString(),
      reductionCount: reductions.length,
      reductions: reductions.map((r) => ({
        providerName: r.providerName,
        previousCap: r.previousCap ?? null,
        newCap: r.newCap,
        reason: r.reason || "context_error",
        reportedLimit: r.reportedLimit ?? null,
        requestedTokens: r.requestedTokens ?? null,
      })),
      finalCap: reductions[reductions.length - 1]?.newCap ?? null,
    },
  });
}
