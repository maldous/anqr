import { CONTEXT_EXPAND_FACTOR } from "./context-expand-factor.mjs";
import { CONTEXT_EXPAND_THRESHOLD } from "./context-expand-threshold.mjs";
import { getOrCreateState } from "./get-or-create-state.mjs";
import { logDebug } from "./logger.mjs";

export function recordContextSuccess(providerName) {
  const state = getOrCreateState(providerName);
  state.consecutiveContextSuccesses++;
  state.consecutiveContextErrors = 0;
  state.lastContextSuccessAt = Date.now();

  if (
    state.consecutiveContextSuccesses >= CONTEXT_EXPAND_THRESHOLD &&
    state.dynamicMaxTokens < state.baseMaxTokens
  ) {
    const previousMax = state.dynamicMaxTokens;
    state.dynamicMaxTokens = Math.min(
      Math.ceil(state.dynamicMaxTokens * CONTEXT_EXPAND_FACTOR),
      state.baseMaxTokens,
    );
    state.consecutiveContextSuccesses = 0;
    if (state.dynamicMaxTokens > previousMax) {
      logDebug(
        `📈 Adaptive context: ${providerName} expanded ${previousMax} → ${state.dynamicMaxTokens} tokens (base: ${state.baseMaxTokens})`,
        {
          providerName,
          previousMax,
          dynamicMaxTokens: state.dynamicMaxTokens,
          baseMaxTokens: state.baseMaxTokens,
        },
      );
    }
  }
}
