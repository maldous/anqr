import {
  selectProvider,
  recordProviderFailure,
  recordProviderFailureCount,
  recordProviderSuccess,
} from "../symphony-credit-gate.mjs";
import {
  recordContextError,
  recordContextSuccess,
  recordRateLimit,
  recordTokenUsage,
  recordErrorType,
  classifyError,
  parseContextErrorDetails,
  parseRateLimitInfo,
  ERROR_TYPES,
} from "../symphony-adaptive-context.mjs";
import { estimateMessagesTokens } from "../symphony-bridge-truncation.mjs";
import {
  updateSessionProvider,
  clearSessionProvider,
  detectCodebuffMode,
  setSessionMessages,
} from "../symphony-session-state.mjs";

import { BRIDGE_METRICS } from "./bridge-metrics.mjs";
import { FALLBACK_DELAY_MS } from "./fallback-delay-ms.mjs";
import { PROBE_CYCLE_INTERVAL_MS } from "./probe-cycle-interval-ms.mjs";
import { PROBE_CYCLE_TURN_THRESHOLD } from "./probe-cycle-turn-threshold.mjs";
import { STATS_LOG_INTERVAL } from "./stats-log-interval.mjs";
import { buildSelectionOptions } from "./build-selection-options.mjs";
import { errorToString } from "./error-to-string.mjs";
import { invokeWithAI } from "./invoke-with-ai.mjs";
import { isRetryableErrorDeep } from "./is-retryable-error-deep.mjs";
import { lastProbeTimeCheck } from "./last-probe-time-check.mjs";
import { logBridgeStats } from "./log-bridge-stats.mjs";
import { nonToolCapableProviders } from "./non-tool-capable-providers.mjs";
import { probeTurnCounter, setProbeTurnCounter } from "./probe-turn-counter.mjs";
import { recordSuccessfulMetrics } from "./record-successful-metrics.mjs";
import { requestCount, setRequestCount } from "./request-count.mjs";
import { runContinuousProviderProbe } from "./run-continuous-provider-probe.mjs";
import { sleep } from "./sleep.mjs";
import { unwrapAIError } from "./unwrap-aierror.mjs";
import { logInfo, logWarn, logError } from "./logger.mjs";

export async function invokeWithFallbackStream(
  messages,
  route,
  onChunk,
  initialExcluded = [],
  sessionId = null,
  cwd = null,
) {
  const triedProviders = [...initialExcluded];
  let lastError = null;
  let attemptNumber = 0;

  // Keep trying providers until we run out (no limit - try ALL providers)
  while (true) {
    attemptNumber++;

    // Get next provider from credit-gate (excluding already-tried ones)
    const provider = await selectProvider(buildSelectionOptions(route, triedProviders, sessionId));

    if (!provider) {
      const excludedByProbe = (route.allowedNames || []).filter((n) =>
        nonToolCapableProviders.has(n),
      );
      let errorMsg;
      if (excludedByProbe.length > 0) {
        errorMsg = `No providers available for ${route.responseModelId} - ${excludedByProbe.join(", ")} excluded by tool-capability probe (non-tool-capable)`;
      } else if (lastError) {
        errorMsg = `All streaming providers failed (tried ${triedProviders.join(", ")}). Last error: ${lastError}`;
      } else {
        errorMsg = `No providers available for ${route.responseModelId} - check env vars and provider failures`;
      }
      throw new Error(errorMsg);
    }
    logInfo(
      `${attemptNumber === 1 ? "🎯 PROVIDER SELECTED" : "🔄 FALLBACK ATTEMPT"}: ${provider.name} (${provider.model}) - attempt ${attemptNumber}`,
    );
    triedProviders.push(provider.name);

    if (attemptNumber > 1) {
      BRIDGE_METRICS.totalFallbacks++;
      await sleep(FALLBACK_DELAY_MS);
    }

    // Note: Codebuff transparent relay is handled in the main POST /v1/chat/completions handler
    // to enable direct SSE passthrough without going through invokeWithFallbackStream

    try {
      const startedAt = Date.now();
      const result = await invokeWithAI(provider, messages, { stream: true, onChunk, cwd });

      const textPreview = result.text?.slice(0, 100) || "";
      logInfo(
        `✅ AI RESULT VALIDATION PASS (streaming): ${provider.name} (attempt ${attemptNumber}, ${result.text?.length || 0} chars)`,
      );
      logInfo(`   Preview: ${textPreview}`);
      recordProviderSuccess(provider.name);
      recordSuccessfulMetrics(provider.name, startedAt, null, true);
      recordContextSuccess(provider.name);
      recordTokenUsage(provider.name, {
        inputTokens: estimateMessagesTokens(messages),
        outputTokens: Math.ceil((result.text?.length || 0) / 4),
      });

      // Update session state
      if (sessionId) {
        const mode =
          detectCodebuffMode(result) || (provider.name === "codebuff" ? "unknown" : null);
        updateSessionProvider(sessionId, { name: provider.name, mode, tier: provider.tier });
        // Store server-side message history for context verification on provider switches
        setSessionMessages(sessionId, messages);
      }

      setRequestCount(requestCount + 1);
      setProbeTurnCounter(probeTurnCounter + 1); // Track turns for probe triggering
      if (requestCount % STATS_LOG_INTERVAL === 0) {
        logBridgeStats();
      }

      // Trigger probe cycle if turn threshold reached OR 30 minutes elapsed
      const timeSinceProbe = Date.now() - lastProbeTimeCheck;
      const shouldProbeByTurns = probeTurnCounter >= PROBE_CYCLE_TURN_THRESHOLD;
      const shouldProbeByTime = timeSinceProbe >= PROBE_CYCLE_INTERVAL_MS;

      if (shouldProbeByTurns || shouldProbeByTime) {
        const reason = shouldProbeByTurns
          ? `turn threshold (${probeTurnCounter}/${PROBE_CYCLE_TURN_THRESHOLD})`
          : `time threshold (${Math.round(timeSinceProbe / 60000)}min / 30min)`;
        logInfo(`🔍 Probe trigger: ${reason}, scheduling probe cycle...`);
        // Schedule probe asynchronously (don't block response)
        setTimeout(() => {
          runContinuousProviderProbe().catch((err) => {
            logError(`Scheduled probe failed: ${err.message}`);
          });
        }, 0);
      }

      return {
        text: result.text,
        providerName: provider.name,
        attempts: attemptNumber,
        triedProviders: [...triedProviders],
        _symphonyResult: result._symphonyResult || null,
      };
    } catch (err) {
      const rootErr = unwrapAIError(err);
      const errStr = errorToString(rootErr === err ? err : rootErr);
      lastError = errStr;
      logWarn(
        `❌ Streaming ${provider.name} failed (attempt ${attemptNumber}): ${errStr.slice(0, 200)}`,
      );

      if (isRetryableErrorDeep(err)) {
        recordProviderFailure(provider.name);
        recordProviderFailureCount(provider.name);
      }

      // Adaptive context: classify error and update provider limits dynamically
      const errorType = classifyError(err);
      recordErrorType(provider.name, errorType);
      if (errorType === ERROR_TYPES.CONTEXT_TOO_LARGE) {
        const details = parseContextErrorDetails(err);
        recordContextError(provider.name, details);
      } else if (errorType === ERROR_TYPES.RATE_LIMITED) {
        const rlInfo = parseRateLimitInfo(err);
        recordRateLimit(provider.name, rlInfo);
      }

      // Clear sticky session immediately so concurrent requests on the same
      // session don't keep trying the failed provider. The next call to
      // buildSelectionOptions will see no sticky and allow all providers.
      if (sessionId) {
        clearSessionProvider(sessionId);
        logInfo(
          `🔓 Cleared sticky session after ${provider.name} streaming failure (${errorType})`,
        );
      }

      // Send error notification to client (but don't end the stream yet)
      if (onChunk) {
        // Include actual error details when errorType is generic/unknown
        const errorDetail =
          errorType === ERROR_TYPES.UNKNOWN || errorType === "unknown"
            ? errStr.slice(0, 100)
            : errorType;
        const errorNotice = `\n⚠️ ${provider.name} failed (${errorDetail}), trying next provider...\n`;
        onChunk({ type: "text", text: errorNotice });
      }

      // Continue to next provider in the loop
      continue;
    }
  }
}
