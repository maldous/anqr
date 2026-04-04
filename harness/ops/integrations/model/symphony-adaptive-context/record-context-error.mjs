// Generated from ../../../../scripts/ops/integrations/model/symphony-adaptive-context.mjs:384

import { MIN_MESSAGE_BUDGET_TOKENS } from "../symphony-bridge-truncation.mjs";

import { CONTEXT_SHRINK_BUFFER } from "./context-shrink-buffer.mjs";
import { CONTEXT_SHRINK_FACTOR } from "./context-shrink-factor.mjs";
import { getOrCreateState } from "./get-or-create-state.mjs";
import { logInfo } from "./logger.mjs";

export function recordContextError(providerName, details) {
  const { requestedTokens, reportedLimit, isTpmRelated, tpmLimit } = details || {};
  const state = getOrCreateState(providerName);
  state.consecutiveContextErrors++;
  state.consecutiveContextSuccesses = 0;
  state.lastContextErrorAt = Date.now();

  const previousMax = state.dynamicMaxTokens;

  if (requestedTokens && reportedLimit && requestedTokens > reportedLimit) {
    const ratio = reportedLimit / requestedTokens;
    state.dynamicMaxTokens = Math.max(
      Math.floor(state.dynamicMaxTokens * ratio * CONTEXT_SHRINK_BUFFER),
      MIN_MESSAGE_BUDGET_TOKENS,
    );
  } else {
    state.dynamicMaxTokens = Math.max(
      Math.floor(state.dynamicMaxTokens * CONTEXT_SHRINK_FACTOR),
      MIN_MESSAGE_BUDGET_TOKENS,
    );
  }

  if (isTpmRelated && tpmLimit) {
    state.rateLimit.tpmLimit = tpmLimit;
  }

  logInfo(
    `📉 Adaptive context: ${providerName} shrunk ${previousMax} → ${state.dynamicMaxTokens} tokens (base: ${state.baseMaxTokens})`,
    {
      providerName,
      previousMax,
      dynamicMaxTokens: state.dynamicMaxTokens,
      baseMaxTokens: state.baseMaxTokens,
      consecutiveErrors: state.consecutiveContextErrors,
      requestedTokens: requestedTokens || null,
      reportedLimit: reportedLimit || null,
      isTpmRelated: !!isTpmRelated,
    },
  );
}
