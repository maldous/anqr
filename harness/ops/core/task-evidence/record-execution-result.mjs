import { updateEvidenceRecord } from "./update-evidence-record.mjs";

export function recordExecutionResult(correlationId, execution) {
  return updateEvidenceRecord(correlationId, {
    execution: {
      startedAt: execution.startedAt || null,
      completedAt: execution.completedAt || new Date().toISOString(),
      durationMs: execution.durationMs ?? null,
      success: execution.success,
      error: execution.error || null,
      filesChanged: execution.filesChanged || [],
    },
  });
}
