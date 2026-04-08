import { getThrottledProviders } from "../symphony-adaptive-context.mjs";
import { getProviderStats } from "../symphony-credit-gate.mjs";
import { getProviderHealthState, HEALTH_STATES } from "../symphony-provider-health.mjs";
import {
  getSessionProvider,
  clearSessionProvider,
  getProviderTurnLimit,
  getEvaluationSampleProvider,
} from "../symphony-session-state.mjs";

import { nonToolCapableProviders } from "./non-tool-capable-providers.mjs";
import { safeLogDebug } from "./safe-log-debug.mjs";
import { toolCapableProviders } from "./tool-capable-providers.mjs";

function isProviderHealthy(providerName) {
  const health = getProviderHealthState(providerName);
  return (
    health.state !== HEALTH_STATES.COOLING_DOWN &&
    health.state !== HEALTH_STATES.BLOCKED &&
    health.state !== HEALTH_STATES.DISABLED
  );
}

export function buildSelectionOptions(route, excludedNames = [], sessionId = null) {
  const throttled = getThrottledProviders();
  const excludeSet = new Set([...excludedNames, ...nonToolCapableProviders, ...throttled]);

  // Prefer already confirmed tool-capable providers when the current request is
  // expected to use tools, but do not hard-exclude other candidates.
  const stats = getProviderStats();
  const allProviderNames =
    route.allowedNames || Object.keys(stats).filter((n) => !excludeSet.has(n));
  const preferredNames =
    route.useTools === true
      ? allProviderNames.filter((name) => toolCapableProviders.has(name) && !excludeSet.has(name))
      : [];
  const evaluationPool = preferredNames.length > 0 ? preferredNames : allProviderNames;
  const evaluationSample = getEvaluationSampleProvider(evaluationPool, stats);

  if (evaluationSample) {
    if (isProviderHealthy(evaluationSample)) {
      safeLogDebug(`🔍 Evaluation cycle: forcing sample of "${evaluationSample}"`);
      return {
        allowedNames: [evaluationSample],
        preferredNames: preferredNames.length > 0 ? preferredNames : null,
        allowSafetyNetOverride: true,
        excludeNames: [...excludeSet],
      };
    }
    safeLogDebug(
      `⚠️ Evaluation cycle: skipping unhealthy sample "${evaluationSample}" — using full provider pool`,
    );
  }

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
          preferredNames: preferredNames.length > 0 ? preferredNames : null,
          allowSafetyNetOverride: true,
          excludeNames: [...excludeSet],
        };
      } else if (turnCount < turnLimit) {
        // Free providers: rotate after turn limit
        safeLogDebug(`📌 Session sticky: ${providerName} (${turnCount}/${turnLimit} turns)`);
        return {
          allowedNames: [providerName],
          preferredNames: preferredNames.length > 0 ? preferredNames : null,
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
    preferredNames: preferredNames.length > 0 ? preferredNames : null,
    allowSafetyNetOverride: true,
    excludeNames: [...excludeSet],
  };
}
