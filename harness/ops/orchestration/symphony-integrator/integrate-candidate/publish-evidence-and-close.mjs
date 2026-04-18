import { transitionIssue, getFinalizationState } from "../../../symphony-state.mjs";
import { updateIssue, addComment, STATES } from "../../../linear-client.mjs";
import { loadEvidenceRecord, validateEvidenceCompleteness } from "../../../core/task-evidence.mjs";
import { findIssueByIdentifier } from "../find-issue-by-identifier.mjs";
import { buildEvidenceComment } from "./build-evidence-comment.mjs";

export async function publishEvidenceAndClose({
  issueIdentifier,
  finalization,
  pushedMainSha,
  changedFiles,
  diffStat,
}) {
  const detail = await findIssueByIdentifier(issueIdentifier);
  if (!detail) {
    // Issue is in evidence_pending phase — self-transition to annotate error.
    // Uses transitionIssue so finalization (lifecycle field) is written through
    // the validated transition path with history recording.
    const currentFin = getFinalizationState(issueIdentifier) || {};
    transitionIssue(issueIdentifier, "evidence_pending", {
      finalization: {
        ...currentFin,
        state: "evidence_pending_closeout",
        integratedMainSha: pushedMainSha,
        changedFiles,
        diffStat,
        lastError: "Linear issue detail unavailable during closeout",
        updatedAt: new Date().toISOString(),
      },
      reason: "missing_linear_detail",
    });
    return { ok: false, reason: "missing_linear_detail" };
  }

  // Evidence completeness gate — R10: closure requires validated evidence
  if (finalization.correlationId) {
    const completeness = validateEvidenceCompleteness(finalization.correlationId, "standard");
    if (!completeness.complete) {
      const currentFin = getFinalizationState(issueIdentifier) || {};
      transitionIssue(issueIdentifier, "evidence_pending", {
        finalization: {
          ...currentFin,
          state: "evidence_pending_closeout",
          integratedMainSha: pushedMainSha,
          changedFiles,
          diffStat,
          lastError: "incomplete_evidence",
          missingEvidence: completeness.missing,
          evidenceRetries: (currentFin.evidenceRetries || 0) + 1,
          updatedAt: new Date().toISOString(),
        },
        reason: "incomplete_evidence",
      });
      return { ok: false, reason: "incomplete_evidence", missing: completeness.missing };
    }
  }

  const evidence = finalization.correlationId
    ? loadEvidenceRecord(finalization.correlationId)
    : null;
  const evidenceComment = buildEvidenceComment({
    issueIdentifier,
    finalization,
    pushedMainSha,
    changedFiles,
    diffStat,
    evidence,
  });

  await addComment(detail.id, evidenceComment);
  await updateIssue(detail.id, { stateId: STATES.done });
  return { ok: true };
}
