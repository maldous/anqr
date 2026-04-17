import { MIN_MESSAGE_BUDGET_TOKENS } from "../symphony-bridge-truncation.mjs";
import { saveDiscoveredPerRequestLimit } from "../symphony-bridge-truncation/save-discovered-per-request-limit.mjs";

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

  // ── Persist discovered per-request limit to cache ────────────────────
  // When a 413 error reports a concrete token limit, persist it so the
  // bridge applies it proactively on future startups instead of re-learning
  // it from another 413 on the first request after restart.
  if (reportedLimit) {
    saveDiscoveredPerRequestLimit(
      providerName,
      reportedLimit,
      isTpmRelated ? "413_tpm_limit" : "413_context_limit",
    );
    // Also update baseMaxTokens so future getEffectiveMaxTokens() calculations
    // respect the discovered limit even after adaptive context expands again.
    if (reportedLimit < state.baseMaxTokens) {
      state.baseMaxTokens = reportedLimit;
    }
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
