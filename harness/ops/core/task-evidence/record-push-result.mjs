import { updateEvidenceRecord } from "./update-evidence-record.mjs";

export function recordPushResult(correlationId, push) {
  return updateEvidenceRecord(correlationId, {
    push: {
      pushedAt: new Date().toISOString(),
      branch: push.branch || null,
      sha: push.sha || null,
      success: push.success,
      error: push.error || null,
    },
  });
}
