import { loadEvidenceRecord } from "./load-evidence-record.mjs";
import { createEvidenceRecord } from "./create-evidence-record.mjs";

/**
 * Ensure an evidence record exists for the given correlationId.
 *
 * If a record already exists, returns it unchanged. If no record exists,
 * creates a skeleton record with the provided metadata and returns it.
 *
 * This is the primary fix for gap G0-1 (A3 alternate executor path):
 * execution paths that bypass the webhook receiver can call this at
 * startup to guarantee evidence writes will succeed.
 *
 * Idempotent and safe to call from multiple paths — if two callers
 * race, `saveEvidence` (tmp+rename) ensures one wins atomically.
 *
 * @param {string} correlationId
 * @param {{ source?: string, issueIdentifier?: string }} metadata
 * @returns {object} The existing or newly created evidence record
 */
export function ensureEvidenceRecord(correlationId, metadata = {}) {
  const existing = loadEvidenceRecord(correlationId);
  if (existing) return existing;
  return createEvidenceRecord(correlationId, {
    source: metadata.source || "unknown",
    issueIdentifier: metadata.issueIdentifier || null,
    receivedAt: metadata.receivedAt || new Date().toISOString(),
    requestIdentifier: metadata.requestIdentifier || null,
    webhookDeliveryId: metadata.webhookDeliveryId || null,
    discordThreadId: metadata.discordThreadId || null,
  });
}
