import { loadEvidenceRecord } from "./load-evidence-record.mjs";
import { saveEvidence } from "./save-evidence.mjs";

export function updateEvidenceRecord(correlationId, patch) {
  const record = loadEvidenceRecord(correlationId);
  if (!record) return null;
  const updated = { ...record, ...patch, updatedAt: new Date().toISOString() };
  saveEvidence(correlationId, updated);
  return updated;
}
