import { getProviderStats, logProviderStats } from "../symphony-credit-gate.mjs";
import {
  cleanupExpiredSessions,
  tuneAdaptiveParams,
  getAdaptiveParams,
} from "../symphony-session-state.mjs";

import { BRIDGE_METRICS } from "./bridge-metrics.mjs";
import { PROBE_COMPLETIONS_BEFORE_RANKING } from "./probe-completions-before-ranking.mjs";
import { PROBE_CYCLE_TURN_THRESHOLD } from "./probe-cycle-turn-threshold.mjs";
import { lastProbeStartTime } from "./last-probe-start-time.mjs";
import { nonToolCapableProviders } from "./non-tool-capable-providers.mjs";
import { probeCompletionCount } from "./probe-completion-count.mjs";
import { probeTurnCounter } from "./probe-turn-counter.mjs";
import { logDebug } from "./logger.mjs";

export function logBridgeStats() {
  const now = Date.now();
  const elapsed = Math.round((now - BRIDGE_METRICS.lastStatsLog) / 1000);

  logDebug(`📊 Bridge Stats (last ${elapsed}s):`);
  logDebug(
    `  Total: ${BRIDGE_METRICS.totalRequests} requests | ${BRIDGE_METRICS.streamingRequests} stream | ${BRIDGE_METRICS.nonStreamingRequests} non-stream`,
  );
  logDebug(
    `  Errors: ${BRIDGE_METRICS.totalErrors} | Fallbacks: ${BRIDGE_METRICS.totalFallbacks} | Tool calls: ${BRIDGE_METRICS.totalToolCalls}`,
  );
  logDebug(
    `  Latency: ${BRIDGE_METRICS.avgResponseTimeMs}ms avg | ${BRIDGE_METRICS.minResponseTimeMs}ms min | ${BRIDGE_METRICS.maxResponseTimeMs}ms max`,
  );
  logDebug(`  Tokens: ${BRIDGE_METRICS.totalTokensIn} in | ${BRIDGE_METRICS.totalTokensOut} out`);

  const topProviders = Object.entries(BRIDGE_METRICS.requestsByProvider)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  if (topProviders.length > 0) {
    const providerStrings = topProviders.map(([k, v]) => k + ":" + v);
    logDebug(`  Top providers: ${providerStrings.join(", ")}`);
  }

  const topErrors = Object.entries(BRIDGE_METRICS.errorsByType)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  if (topErrors.length > 0) {
    const errorStrings = topErrors.map(([k, v]) => k + ":" + v);
    logDebug(`  Top errors: ${errorStrings.join(", ")}`);
  }

  BRIDGE_METRICS.lastStatsLog = now;

  // Self-tune adaptive parameters
  const stats = getProviderStats();
  tuneAdaptiveParams(stats);

  logProviderStats({ excludeNames: nonToolCapableProviders });

  const timeSinceProbe = Math.round((Date.now() - lastProbeStartTime) / 60000);
  logDebug(
    `🔍 Provider probe: ${probeCompletionCount}/${PROBE_COMPLETIONS_BEFORE_RANKING} completions, ${probeTurnCounter}/${PROBE_CYCLE_TURN_THRESHOLD} turns, ${timeSinceProbe}min since last cycle`,
  );

  // Log adaptive params
  const adaptiveParams = getAdaptiveParams();
  const customLimits = Object.entries(adaptiveParams.freeTurnLimit.perProvider)
    .map(([p, l]) => `${p}:${l}`)
    .join(", ");
  if (customLimits) {
    logDebug(`🎯 Adaptive turn limits: ${customLimits}`);
  }

  // Cleanup expired sessions
  cleanupExpiredSessions();
}
