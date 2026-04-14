import { patchIssueState, getFinalizationState } from "../../../symphony-state.mjs";
import { updateIssue, addComment, STATES } from "../../../linear-client.mjs";
import { loadEvidenceRecord } from "../../../core/task-evidence.mjs";
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
    // Metadata-only update — the issue is already in evidence_pending phase.
    // Use patchIssueState (not transitionIssue) because this is not a lifecycle
    // change — it's just annotating the error for retry.
    const currentFin = getFinalizationState(issueIdentifier) || {};
    patchIssueState(issueIdentifier, {
      finalization: {
        ...currentFin,
        state: "evidence_pending_closeout",
        integratedMainSha: pushedMainSha,
        changedFiles,
        diffStat,
        lastError: "Linear issue detail unavailable during closeout",
        updatedAt: new Date().toISOString(),
      },
    });
    return { ok: false, reason: "missing_linear_detail" };
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
