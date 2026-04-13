import { saveEvidence } from "./save-evidence.mjs";

export function createEvidenceRecord(correlationId, ingressMetadata) {
  const record = {
    correlationId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ingress: {
      source: ingressMetadata.source || null,
      receivedAt: ingressMetadata.receivedAt || new Date().toISOString(),
      issueIdentifier: ingressMetadata.issueIdentifier || null,
      requestIdentifier: ingressMetadata.requestIdentifier || null,
      webhookDeliveryId: ingressMetadata.webhookDeliveryId || null,
      discordThreadId: ingressMetadata.discordThreadId || null,
    },
    routing: null,
    worktreeSelection: null,
    providerSelection: null,
    execution: null,
    validation: null,
    push: null,
    integration: null,
    watchdog: [],
    events: [],
  };
  saveEvidence(correlationId, record);
  return record;
}
