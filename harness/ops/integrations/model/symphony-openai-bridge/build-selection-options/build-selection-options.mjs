import { getThrottledProviders } from "../../symphony-adaptive-context.mjs";
import {
  getSessionProvider,
  clearSessionProvider,
  getProviderTurnLimit,
} from "../../symphony-session-state.mjs";

import { nonToolCapableProviders } from "../non-tool-capable-providers.mjs";
import { safeLogDebug } from "../safe-log-debug.mjs";
import { isProviderHealthy } from "./is-provider-healthy.mjs";

export function buildSelectionOptions(route, excludedNames = [], sessionId = null) {
  const throttled = getThrottledProviders();
  const excludeSet = new Set([...excludedNames, ...nonToolCapableProviders, ...throttled]);

  // Check session state for sticky provider
  if (sessionId) {
    const sessionState = getSessionProvider(sessionId);
    if (sessionState) {
      const { provider: providerName, mode, tier, turnCount } = sessionState;
      const turnLimit = getProviderTurnLimit(providerName);

      // P0 FIX: If the sticky provider is excluded or unhealthy (cooling-down,
      // blocked, disabled), clear the sticky immediately and allow ALL providers.
      // Never restrict allowedNames to a single unavailable provider — that causes
      // the "No providers available" P0 outage.
      if (excludeSet.has(providerName) || !isProviderHealthy(providerName)) {
        safeLogDebug(
          `⚠️ Sticky provider ${providerName} is ${excludeSet.has(providerName) ? "excluded" : "unhealthy"} — clearing sticky, allowing all providers`,
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
