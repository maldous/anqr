import { updateEvidenceRecord } from "./update-evidence-record.mjs";

export function recordIntegrationResult(correlationId, integration) {
  return updateEvidenceRecord(correlationId, {
    integration: {
      integratedAt: new Date().toISOString(),
      mainSha: integration.mainSha || null,
      success: integration.success,
      method: integration.method || null,
      error: integration.error || null,
    },
  });
}
