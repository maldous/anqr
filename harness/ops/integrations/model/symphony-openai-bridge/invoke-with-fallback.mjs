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
import { releaseProviderLease } from "../symphony-credit-gate/release-provider-lease.mjs";

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
import { isInvalidModelAnswerText } from "./is-invalid-model-answer-text.mjs";
import { logDebug, logInfo, logWarn, logError } from "./logger.mjs";

export async function invokeWithFallback(messages, route, sessionId = null, cwd = null) {
  const triedProviders = [];
  const fallbackChain = [];
  let lastError = null;
  let attemptNumber = 0;
  let contextBudgetCap = null;

  logDebug(`[invokeWithFallback] Starting fallback cascade`, {
    routeModelId: route.responseModelId,
    allowedNames: route.allowedNames,
    sessionId: sessionId ? sessionId.slice(0, 12) + "..." : null,
    messageCount: messages?.length,
  });

  if (shouldTriggerEvalCycle()) {
    logInfo(`🔍 Periodic evaluation cycle: sampling underused providers`);
  }

  while (true) {
    attemptNumber++;
    logDebug(`[invokeWithFallback] Attempt ${attemptNumber}/10`, {
      triedProviders,
      lastError: lastError ? lastError.slice(0, 100) : null,
    });

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

    const isCodebuffProvider =
      provider.driver === "codebuff-sdk" ||
      provider.name === "codebuff" ||
      provider.name.startsWith("codebuff-");

    logInfo(
      `${attemptNumber === 1 ? "Selected" : "Fallback"} provider (attempt ${attemptNumber}): ${provider.name} (${provider.model})`,
    );
    triedProviders.push(provider.name);

    if (attemptNumber > 1) {
      BRIDGE_METRICS.totalFallbacks++;
      await sleep(FALLBACK_DELAY_MS);
    }

    const attemptStartMs = Date.now();
    try {
      const startedAt = attemptStartMs;
      logDebug(`[invokeWithFallback] Invoking provider`, {
        providerName: provider.name,
        attemptNumber,
      });
      const result = isCodebuffProvider
        ? await invokeCodebuffDirect({
            messages,
            cwd: cwd || getCurrentRequestCwd(),
            costMode: provider.costMode === "free" ? "free" : undefined,
          })
        : await invokeWithAI(provider, messages, {
            stream: false,
            cwd,
            useTools: route.useTools,
            maxContextBudget: contextBudgetCap,
          });

      if (
        isCodebuffProvider &&
        isInvalidModelAnswerText(result.text, {
          allowSentinel: process.env.SYMPHONY_ALLOW_NO_REPLY_SENTINEL === "1",
        })
      ) {
        const invalidErr = new Error(`Invalid sentinel response from ${provider.name}`);
        invalidErr.code = "INVALID_SENTINEL_RESPONSE";
        invalidErr.providerName = provider.name;
        invalidErr.retryable = true;
        throw invalidErr;
      }

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

      if (sessionId) {
        const mode =
          detectCodebuffMode(result) ||
          (isCodebuffProvider ? provider.sessionMode || provider.costMode || "paid" : null);
        updateSessionProvider(sessionId, { name: provider.name, mode, tier: provider.tier });
        setSessionMessages(sessionId, messages);
      }

      setRequestCount(requestCount + 1);
      if (requestCount % STATS_LOG_INTERVAL === 0) {
        logBridgeStats();
      }

      releaseProviderLease(provider);
      fallbackChain.push({
        providerName: provider.name,
        model: provider.model,
        attemptNumber,
        outcome: "success",
        durationMs: Date.now() - attemptStartMs,
      });
      return {
        text: result.text,
        usage: result.usage,
        providerName: provider.name,
        attempts: attemptNumber,
        triedProviders: [...triedProviders],
        fallbackChain: [...fallbackChain],
        _symphonyResult: result._symphonyResult || null,
      };
    } catch (err) {
      const rootErr = unwrapAIError(err);
      const errStr = errorToString(rootErr === err ? err : rootErr);
      lastError = errStr;
      const errorType = classifyError(err);
      const isRetryable =
        err?.retryable === true ||
        isRetryableErrorDeep(err) ||
        [
          ERROR_TYPES.CONTEXT_TOO_LARGE,
          ERROR_TYPES.RATE_LIMITED,
          ERROR_TYPES.TIMEOUT,
          ERROR_TYPES.SERVER_ERROR,
        ].includes(errorType);
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

      recordErrorType(provider.name, errorType);
      if (errorType === ERROR_TYPES.CONTEXT_TOO_LARGE) {
        const details = parseContextErrorDetails(err);
        recordContextError(provider.name, details);
        // Propagate the smallest known limit across the fallback chain so
        // subsequent providers cap their tool + message budget immediately
        // instead of repeating the same oversized request.
        const limit = details.reportedLimit;
        if (limit) {
          contextBudgetCap = contextBudgetCap ? Math.min(contextBudgetCap, limit) : limit;
          logInfo(
            `📉 Context budget cap: ${contextBudgetCap} tokens (from ${provider.name} limit=${limit})`,
          );
        } else if (details.requestedTokens) {
          const estimated = Math.floor(details.requestedTokens * 0.6);
          contextBudgetCap = contextBudgetCap ? Math.min(contextBudgetCap, estimated) : estimated;
          logInfo(
            `📉 Context budget cap (estimated): ${contextBudgetCap} tokens (from ${provider.name} requested=${details.requestedTokens})`,
          );
        }
      } else if (errorType === ERROR_TYPES.RATE_LIMITED) {
        const rlInfo = parseRateLimitInfo(err);
        recordRateLimit(provider.name, rlInfo);
      }

      releaseProviderLease(provider);
      fallbackChain.push({
        providerName: provider.name,
        model: provider.model,
        attemptNumber,
        outcome: "failure",
        durationMs: Date.now() - attemptStartMs,
        errorType: errorType || "unknown",
        errorMessage: errStr.slice(0, 200),
      });
      if (sessionId) {
        clearSessionProvider(sessionId);
        logInfo(`🔓 Cleared sticky session after ${provider.name} failure (${errorType})`);
      }

      continue;
    }
  }
}
