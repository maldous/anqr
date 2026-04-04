// Generated from ../../../../scripts/ops/integrations/model/symphony-adaptive-context.mjs:544

import { TPM_PROACTIVE_THRESHOLD } from "./tpm-proactive-threshold.mjs";
import { getOrCreateState } from "./get-or-create-state.mjs";
import { getTokensPerMinute } from "./get-tokens-per-minute.mjs";

export function shouldReduceContextForTPM(providerName, estimatedTokens) {
  const state = getOrCreateState(providerName);
  const { tpmLimit } = state.rateLimit;
  if (!tpmLimit) return false;
  const currentTPM = getTokensPerMinute(providerName);
  return currentTPM + estimatedTokens > tpmLimit * TPM_PROACTIVE_THRESHOLD;
}
