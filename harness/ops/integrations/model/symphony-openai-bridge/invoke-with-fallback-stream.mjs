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
import { invokeCodebuffDirectStream } from "../codebuff-direct.mjs";
import { releaseProviderLease } from "../symphony-credit-gate/release-provider-lease.mjs";
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

  while (true) {
    attemptNumber++;

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

    try {
      const startedAt = Date.now();
      const isCodebuffProvider =
        provider.driver === "codebuff-sdk" ||
        provider.name === "codebuff" ||
        provider.name.startsWith("codebuff-");
      const result = isCodebuffProvider
        ? await invokeCodebuffDirectStream({
            messages,
            cwd,
            costMode: provider.costMode === "free" ? "free" : undefined,
            onTextChunk: (text) => {
              if (onChunk) {
                onChunk({ type: "text", text });
              }
            },
          })
        : await invokeWithAI(provider, messages, { stream: true, onChunk, cwd });

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

      if (sessionId) {
        const mode =
          detectCodebuffMode(result) ||
          (isCodebuffProvider ? provider.sessionMode || provider.costMode || "paid" : null);
        updateSessionProvider(sessionId, { name: provider.name, mode, tier: provider.tier });
        setSessionMessages(sessionId, messages);
      }

      setRequestCount(requestCount + 1);
      setProbeTurnCounter(probeTurnCounter + 1);
      if (requestCount % STATS_LOG_INTERVAL === 0) {
        logBridgeStats();
      }

      const timeSinceProbe = Date.now() - lastProbeTimeCheck;
      const shouldProbeByTurns = probeTurnCounter >= PROBE_CYCLE_TURN_THRESHOLD;
      const shouldProbeByTime = timeSinceProbe >= PROBE_CYCLE_INTERVAL_MS;

      if (shouldProbeByTurns || shouldProbeByTime) {
        const reason = shouldProbeByTurns
          ? `turn threshold (${probeTurnCounter}/${PROBE_CYCLE_TURN_THRESHOLD})`
          : `time threshold (${Math.round(timeSinceProbe / 60000)}min / 30min)`;
        logInfo(`🔍 Probe trigger: ${reason}, scheduling probe cycle...`);
        setTimeout(() => {
          runContinuousProviderProbe().catch((err) => {
            logError(`Scheduled probe failed: ${err.message}`);
          });
        }, 0);
      }

      releaseProviderLease(provider);
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

      const errorType = classifyError(err);
      recordErrorType(provider.name, errorType);
      if (errorType === ERROR_TYPES.CONTEXT_TOO_LARGE) {
        const details = parseContextErrorDetails(err);
        recordContextError(provider.name, details);
      } else if (errorType === ERROR_TYPES.RATE_LIMITED) {
        const rlInfo = parseRateLimitInfo(err);
        recordRateLimit(provider.name, rlInfo);
      }

      releaseProviderLease(provider);
      if (sessionId) {
        clearSessionProvider(sessionId);
        logInfo(
          `🔓 Cleared sticky session after ${provider.name} streaming failure (${errorType})`,
        );
      }

      if (onChunk) {
        const errorDetail =
          errorType === ERROR_TYPES.UNKNOWN || errorType === "unknown"
            ? errStr.slice(0, 100)
            : errorType;
        const errorNotice = `
⚠️ ${provider.name} failed (${errorDetail}), trying next provider...
`;
        onChunk({ type: "text", text: errorNotice });
      }

      continue;
    }
  }
}
