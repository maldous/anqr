// Generated from ../../../../scripts/ops/integrations/model/symphony-openai-bridge.mjs:4847

import {
  updateSessionProvider,
  clearSessionProvider,
  detectCodebuffMode,
  shouldTriggerEvalCycle,
  setSessionMessages,
} from "../symphony-session-state.mjs";
import {
  selectProvider,
  recordProviderFailure,
  recordProviderFailureCount,
  recordProviderSuccess,
} from "../symphony-credit-gate.mjs";
import { invokeCodebuffDirect } from "../codebuff-direct.mjs";
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

import { BRIDGE_METRICS } from "./bridge-metrics.mjs";
import { FALLBACK_DELAY_MS } from "./fallback-delay-ms.mjs";
import { STATS_LOG_INTERVAL } from "./stats-log-interval.mjs";
import { buildSelectionOptions } from "./build-selection-options.mjs";
import { errorToString } from "./error-to-string.mjs";
import { getCurrentRequestCwd } from "./get-current-request-cwd.mjs";
import { invokeWithAI } from "./invoke-with-ai.mjs";
import { isRetryableErrorDeep } from "./is-retryable-error-deep.mjs";
import { logBridgeStats } from "./log-bridge-stats.mjs";
import { nonToolCapableProviders } from "./non-tool-capable-providers.mjs";
import { recordSuccessfulMetrics } from "./record-successful-metrics.mjs";
import { requestCount, setRequestCount } from "./request-count.mjs";
import { sleep } from "./sleep.mjs";
import { unwrapAIError } from "./unwrap-aierror.mjs";
import { logDebug, logInfo, logWarn, logError } from "./logger.mjs";

export async function invokeWithFallback(messages, route, sessionId = null, cwd = null) {
  const triedProviders = [];
  let lastError = null;
  let attemptNumber = 0;

  logDebug(`[invokeWithFallback] Starting fallback cascade`, {
    routeModelId: route.responseModelId,
    allowedNames: route.allowedNames,
    sessionId: sessionId ? sessionId.slice(0, 12) + "..." : null,
    messageCount: messages?.length,
  });

  // Check if it's time for periodic evaluation
  if (shouldTriggerEvalCycle()) {
    logInfo(`🔍 Periodic evaluation cycle: sampling underused providers`);
  }

  // Keep trying providers until we run out (no limit - try ALL providers)
  while (true) {
    attemptNumber++;
    logDebug(`[invokeWithFallback] Attempt ${attemptNumber}/10`, {
      triedProviders,
      lastError: lastError ? lastError.slice(0, 100) : null,
    });

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
        errorMsg = `All providers failed (tried ${triedProviders.join(", ")}). Last error: ${lastError}`;
      } else {
        errorMsg = `No providers available for ${route.responseModelId} - check env vars and provider failures`;
      }
      logError(`[invokeWithFallback] No provider available`, {
        attemptNumber,
        triedProviders,
        excludedByProbe,
        routeModelId: route.responseModelId,
        lastError: lastError ? lastError.slice(0, 200) : null,
      });
      throw new Error(errorMsg);
    }

    logInfo(
      `${attemptNumber === 1 ? "Selected" : "Fallback"} provider (attempt ${attemptNumber}): ${provider.name} (${provider.model})`,
    );
    triedProviders.push(provider.name);

    if (attemptNumber > 1) {
      BRIDGE_METRICS.totalFallbacks++;
      await sleep(FALLBACK_DELAY_MS);
    }

    try {
      const startedAt = Date.now();
      logDebug(`[invokeWithFallback] Invoking provider`, {
        providerName: provider.name,
        attemptNumber,
      });
      const result =
        provider.name === "codebuff"
          ? await invokeCodebuffDirect({
              messages,
              cwd: cwd || getCurrentRequestCwd(),
            })
          : await invokeWithAI(provider, messages, { stream: false, cwd });

      const durationMs = Date.now() - startedAt;
      const textPreview = result.text?.slice(0, 100) || "";
      logInfo(
        `✅ AI RESULT VALIDATION PASS: ${provider.name} (attempt ${attemptNumber}, ${durationMs}ms, ${result.text?.length || 0} chars)`,
      );
      logInfo(`   Preview: ${textPreview}`);
      recordProviderSuccess(provider.name);
      recordSuccessfulMetrics(provider.name, startedAt, result.usage, true);
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
      if (requestCount % STATS_LOG_INTERVAL === 0) {
        logBridgeStats();
      }

      return {
        text: result.text,
        usage: result.usage,
        providerName: provider.name,
        attempts: attemptNumber,
        triedProviders: [...triedProviders],
        _symphonyResult: result._symphonyResult || null,
      };
    } catch (err) {
      const rootErr = unwrapAIError(err);
      const errStr = errorToString(rootErr === err ? err : rootErr);
      lastError = errStr;
      const isRetryable = isRetryableErrorDeep(err);
      logWarn(`❌ ${provider.name} failed (attempt ${attemptNumber}): ${errStr.slice(0, 200)}`, {
        providerName: provider.name,
        attemptNumber,
        isRetryable,
        errorType: err?.constructor?.name,
      });
      logDebug(`[invokeWithFallback] Provider failure details`, {
        providerName: provider.name,
        errorMessage: errStr.slice(0, 500),
        isRetryable,
        willRecordFailure: isRetryable,
      });

      if (isRetryable) {
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
      // session don't keep trying the failed provider.
      if (sessionId) {
        clearSessionProvider(sessionId);
        logInfo(`🔓 Cleared sticky session after ${provider.name} failure (${errorType})`);
      }

      // Continue to next provider in the loop
    }
  }
}
