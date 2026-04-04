import {
  PROVIDER_MAX_INPUT_TOKENS,
  DEFAULT_MAX_INPUT_TOKENS,
  MIN_MESSAGE_BUDGET_TOKENS,
} from "../symphony-bridge-truncation.mjs";

import { CONTEXT_INITIAL_BUFFER } from "./context-initial-buffer.mjs";
import { ERROR_TYPES } from "./error-types.mjs";

export function createProviderState(providerName) {
  const baseMaxTokens = PROVIDER_MAX_INPUT_TOKENS[providerName] || DEFAULT_MAX_INPUT_TOKENS;
  // Start with safety margin to avoid immediate 413 on first request
  const initialMaxTokens = Math.max(
    Math.floor(baseMaxTokens * CONTEXT_INITIAL_BUFFER),
    MIN_MESSAGE_BUDGET_TOKENS,
  );
  return {
    providerName,
    baseMaxTokens,
    dynamicMaxTokens: initialMaxTokens,
    consecutiveContextErrors: 0,
    consecutiveContextSuccesses: 0,
    lastContextErrorAt: null,
    lastContextSuccessAt: null,
    tokenEvents: [],
    requestEvents: [],
    rateLimit: {
      throttledUntil: null,
      lastRetryAfterMs: null,
      rpmLimit: null,
      rpmRemaining: null,
      rpmResetAt: null,
      tpmLimit: null,
      tpmRemaining: null,
      tpmResetAt: null,
    },
    errorCounts: {
      [ERROR_TYPES.CONTEXT_TOO_LARGE]: 0,
      [ERROR_TYPES.RATE_LIMITED]: 0,
      [ERROR_TYPES.AUTH_ERROR]: 0,
      [ERROR_TYPES.TIMEOUT]: 0,
      [ERROR_TYPES.SERVER_ERROR]: 0,
      [ERROR_TYPES.UNKNOWN]: 0,
      [ERROR_TYPES.TOOL_HALLUCINATION]: 0,
    },
  };
}
