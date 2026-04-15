import { loadEvidenceRecordWithDiagnostics } from "./load-evidence-record-with-diagnostics.mjs";
import { saveEvidence } from "./save-evidence.mjs";
import { withEvidenceLock } from "./with-evidence-lock.mjs";

export function updateEvidenceRecord(correlationId, patch) {
  return withEvidenceLock(correlationId, () => {
    const diag = loadEvidenceRecordWithDiagnostics(correlationId);
    if (diag.status === "missing") return null;
    if (diag.status === "corrupted") {
      process.stderr.write(
        `[task-evidence] Corrupted record ${correlationId}: ${diag.error}\n`,
      );
      return null;
    }
    const updated = { ...diag.record, ...patch, updatedAt: new Date().toISOString() };
    saveEvidence(correlationId, updated);
    return updated;
  });
}
