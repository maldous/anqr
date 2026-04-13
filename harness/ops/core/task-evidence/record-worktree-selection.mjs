import { updateEvidenceRecord } from "./update-evidence-record.mjs";

export function recordWorktreeSelection(correlationId, selection) {
  return updateEvidenceRecord(correlationId, {
    worktreeSelection: {
      selectedAt: new Date().toISOString(),
      worktreeId: selection.worktreeId,
      reason: selection.reason || null,
    },
  });
}
