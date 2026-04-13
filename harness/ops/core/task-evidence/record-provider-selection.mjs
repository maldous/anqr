import { updateEvidenceRecord } from "./update-evidence-record.mjs";

export function recordProviderSelection(correlationId, provider) {
  return updateEvidenceRecord(correlationId, {
    providerSelection: {
      selectedAt: new Date().toISOString(),
      providerName: provider.providerName,
      model: provider.model || null,
      isFallback: provider.isFallback || false,
      fallbackReason: provider.fallbackReason || null,
    },
  });
}
