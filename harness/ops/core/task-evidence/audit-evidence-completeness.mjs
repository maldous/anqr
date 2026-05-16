import { loadEvidenceRecordWithDiagnostics } from "./load-evidence-record-with-diagnostics.mjs";
import { validateEvidenceCompleteness } from "./validate-evidence-completeness.mjs";

/**
 * Audit evidence completeness for a single correlation ID.
 *
 * Returns a structured report showing completeness at every level
 * and the full evidence record for inspection.
 *
 * @param {string} correlationId
 * @returns {{ correlationId: string, status: string, error?: string, levels?: object, highestComplete?: string, record?: object }}
 */
export function auditEvidenceCompleteness(correlationId) {
  const diag = loadEvidenceRecordWithDiagnostics(correlationId);
  if (diag.status !== "ok") {
    return { correlationId, status: diag.status, error: diag.error || null };
  }

  const minimal = validateEvidenceCompleteness(correlationId, "minimal");
  const standard = validateEvidenceCompleteness(correlationId, "standard");
  const full = validateEvidenceCompleteness(correlationId, "full");

  let highestComplete;
  if (full.complete) {
    highestComplete = "full";
  } else if (standard.complete) {
    highestComplete = "standard";
  } else if (minimal.complete) {
    highestComplete = "minimal";
  } else {
    highestComplete = "none";
  }

  return {
    correlationId,
    status: "ok",
    levels: {
      minimal: { complete: minimal.complete, missing: minimal.missing },
      standard: { complete: standard.complete, missing: standard.missing },
      full: { complete: full.complete, missing: full.missing },
    },
    highestComplete,
    record: diag.record,
  };
}
