import { updateIssue, addComment, STATES } from "../../../linear-client.mjs";
import {
  loadEvidenceRecord,
  updateEvidenceRecord,
  validateEvidenceCompleteness,
} from "../../../core/task-evidence.mjs";
import { findIssueByIdentifier } from "../find-issue-by-identifier.mjs";
import { buildEvidenceComment } from "./build-evidence-comment.mjs";

/**
 * Force-close an issue with incomplete evidence.
 *
 * Records the override in the evidence record and posts the evidence
 * comment with a warning banner. Used after MAX_EVIDENCE_RETRIES
 * failed attempts to collect complete evidence.
 *
 * @param {{ issueIdentifier: string, finalization: object, pushedMainSha: string, changedFiles: string[], diffStat: string, operatorReason: string }} params
 * @returns {Promise<{ ok: boolean, forced: boolean, reason?: string }>}
 */
export async function forceCloseWithIncompleteEvidence({
  issueIdentifier,
  finalization,
  pushedMainSha,
  changedFiles,
  diffStat,
  operatorReason,
}) {
  if (finalization.correlationId) {
    try {
      const completeness = validateEvidenceCompleteness(finalization.correlationId, "standard");
      updateEvidenceRecord(finalization.correlationId, {
        evidenceOverride: {
          forced: true,
          reason: operatorReason,
          forcedAt: new Date().toISOString(),
          missingFields: completeness.missing,
        },
      });
    } catch {
      /* best-effort override recording */
    }
  }

  const detail = await findIssueByIdentifier(issueIdentifier);
  if (!detail) {
    return { ok: false, reason: "missing_linear_detail", forced: true };
  }

  const evidence = finalization.correlationId
    ? loadEvidenceRecord(finalization.correlationId)
    : null;

  const overrideBanner = [
    "⚠️ **Evidence override** — closure forced with incomplete evidence.",
    `Reason: ${operatorReason}`,
    "",
  ].join("\n");

  const evidenceComment =
    overrideBanner +
    buildEvidenceComment({
      issueIdentifier,
      finalization,
      pushedMainSha,
      changedFiles,
      diffStat,
      evidence,
    });

  await addComment(detail.id, evidenceComment);
  await updateIssue(detail.id, { stateId: STATES.done });
  return { ok: true, forced: true };
}
