import { updateEvidenceRecord } from "./update-evidence-record.mjs";

export function recordRoutingDecision(correlationId, routing) {
  return updateEvidenceRecord(correlationId, {
    routing: {
      decidedAt: new Date().toISOString(),
      targetWorktreePool: routing.targetWorktreePool || null,
      routingStrategy: routing.routingStrategy || null,
      queuePosition: routing.queuePosition ?? null,
    },
  });
}
