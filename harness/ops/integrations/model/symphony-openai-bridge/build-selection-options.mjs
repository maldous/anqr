import { getThrottledProviders } from "../symphony-adaptive-context.mjs";
import { getProviderStats } from "../symphony-credit-gate.mjs";
import {
  getSessionProvider,
  clearSessionProvider,
  getProviderTurnLimit,
  getEvaluationSampleProvider,
} from "../symphony-session-state.mjs";

import { nonToolCapableProviders } from "./non-tool-capable-providers.mjs";
import { safeLogDebug } from "./safe-log-debug.mjs";

export function buildSelectionOptions(route, excludedNames = [], sessionId = null) {
  const throttled = getThrottledProviders();
  const excludeSet = new Set([...excludedNames, ...nonToolCapableProviders, ...throttled]);

  // Check if evaluation cycle wants to force-sample a specific provider
  const stats = getProviderStats();
  const allProviderNames =
    route.allowedNames || Object.keys(stats).filter((n) => !excludeSet.has(n));
  const evaluationSample = getEvaluationSampleProvider(allProviderNames, stats);

  if (evaluationSample) {
    safeLogDebug(`🔍 Evaluation cycle: forcing sample of "${evaluationSample}"`);
    return {
      allowedNames: [evaluationSample],
      allowSafetyNetOverride: true,
      excludeNames: [...excludeSet],
    };
  }

  // Check session state for sticky provider
  if (sessionId) {
    const sessionState = getSessionProvider(sessionId);
    if (sessionState) {
      const { provider: providerName, mode, tier, turnCount } = sessionState;
      const turnLimit = getProviderTurnLimit(providerName);

      // P0 FIX: If the sticky provider is already in the exclude set (e.g., recently
      // failed, non-tool-capable, or explicitly excluded), clear the sticky immediately
      // and allow ALL providers. Never restrict allowedNames to a single unavailable
      // provider — that causes the "No providers available" P0 outage.
      if (excludeSet.has(providerName)) {
        safeLogDebug(
          `⚠️ Sticky provider ${providerName} is excluded — clearing sticky, allowing all providers`,
        );
        clearSessionProvider(sessionId);
        // Fall through to return unrestricted options below
      } else if (tier === "paid" && mode === "paid") {
        // Paid providers: stick until exhausted
        safeLogDebug(`📌 Session sticky: ${providerName} (paid mode, ${turnCount} turns)`);
        return {
          allowedNames: [providerName],
          allowSafetyNetOverride: true,
          excludeNames: [...excludeSet],
        };
      } else if (turnCount < turnLimit) {
        // Free providers: rotate after turn limit
        safeLogDebug(`📌 Session sticky: ${providerName} (${turnCount}/${turnLimit} turns)`);
        return {
          allowedNames: [providerName],
          allowSafetyNetOverride: true,
          excludeNames: [...excludeSet],
        };
      }
      // Rotation: turn limit reached, exclude current provider to force rotation
      safeLogDebug(`🔄 Rotating: ${providerName} (${turnCount}/${turnLimit} turns reached)`);
      excludeSet.add(providerName);
      clearSessionProvider(sessionId);
    }
  }

  return {
    allowedNames: route.allowedNames,
    allowSafetyNetOverride: true,
    excludeNames: [...excludeSet],
  };
}
