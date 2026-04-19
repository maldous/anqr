import {
  truncateMessagesForProvider,
  estimateMessagesTokens,
} from "../symphony-bridge-truncation.mjs";
import {
  getEffectiveMaxTokens,
  classifyError,
  shouldReduceContextForTPM,
  ERROR_TYPES,
} from "../symphony-adaptive-context.mjs";
import { generateText, streamText, stepCountIs } from "ai";

import { MAX_RESPONSE_TEXT_BYTES } from "./max-response-text-bytes.mjs";
import { MAX_TOOL_ITERATIONS } from "./max-tool-iterations.mjs";
import { RAW_TOOL_JSON_RE } from "./raw-tool-json-re.mjs";
import { convertMessages } from "./convert-messages.mjs";
import { createProviderModel } from "./create-provider-model.mjs";
import { getCurrentRequestId } from "./get-current-request-id.mjs";
import { errorToString } from "./error-to-string.mjs";
import { estimateToolOverheadTokens } from "./estimate-tool-overhead-tokens.mjs";
import { invokeWithCodex } from "./invoke-with-codex.mjs";
import { isInvalidModelAnswerText } from "./is-invalid-model-answer-text.mjs";
import { isRetryableErrorDeep } from "./is-retryable-error-deep.mjs";
import { nonToolCapableProviders } from "./non-tool-capable-providers.mjs";
import { classifyToolProbeErrorOutcome } from "./classify-tool-probe-error-outcome.mjs";
import { providerSupportsTools } from "./provider-supports-tools.mjs";
import { sleep } from "./sleep.mjs";
import { selectToolsForProvider } from "./select-tools-for-provider.mjs";
import { trackFileChange } from "./track-file-change.mjs";
import { unwrapAIError } from "./unwrap-aierror.mjs";
import { logDebug, logInfo, logWarn, logError } from "./logger.mjs";

export async function invokeWithAIInner(provider, messages, options = {}) {
  const { stream = false, onChunk } = options;

  logDebug(`[invokeWithAI] Entry`, {
    providerName: provider.name,
    providerModel: provider.model,
    stream,
    messageCount: messages?.length,
    hasOnChunk: !!onChunk,
  });

  if (provider.driver === "codex-sdk" || provider.name === "codex") {
    logDebug(`[invokeWithAI] Routing to Codex SDK`, { providerName: provider.name });
    return invokeWithCodex(provider, messages, options);
  }

  // Create the provider model
  const model = createProviderModel(provider);

  if (!model) {
    logError(`[invokeWithAI] Failed to create provider model`, {
      providerName: provider.name,
      providerModel: provider.model,
    });
    throw new Error(`Provider ${provider.name} not supported with AI SDK`);
  }

  // Use strict tool-capability check: only providers confirmed via probe
  // or in the KNOWN_TOOL_CAPABLE allowlist get tools.  Unprobed+unknown
  // providers are rejected to prevent tool-call failures during demos.
  let useTools =
    options.useTools === false ? false : providerSupportsTools(provider.name, { strict: true });
  logInfo(
    `Using AI SDK with provider: ${provider.name} (${provider.model})${useTools ? "" : " [no-tools]"}`,
  );
  logDebug(`[invokeWithAI] Provider configuration`, {
    providerName: provider.name,
    providerModel: provider.model,
    useTools,
    hasBaseUrl: !!provider.baseUrl,
    hasApiKey: !!provider.apiKey,
  });

  // Convert messages to AI SDK format and truncate for provider's context limit
  logDebug(`[invokeWithAI] Converting messages`, { messageCount: messages?.length });
  const rawMessages = convertMessages(messages);
  logDebug(`[invokeWithAI] Messages after conversion`, {
    rawMessageCount: rawMessages?.length,
    totalChars: rawMessages?.reduce(
      (sum, m) => sum + (typeof m.content === "string" ? m.content.length : 0),
      0,
    ),
  });

  const estimatedInputTokens = estimateMessagesTokens(rawMessages);
  let effectiveMax = getEffectiveMaxTokens(provider.name);

  // Check TPM reduction BEFORE tool selection so the tool tier matches the final budget.
  // Use worst-case (full tool set) overhead for the TPM estimate.
  const worstCaseToolOverhead = useTools ? estimateToolOverheadTokens() : 0;
  const worstCaseRequestTokens = estimatedInputTokens + worstCaseToolOverhead;
  if (shouldReduceContextForTPM(provider.name, worstCaseRequestTokens)) {
    effectiveMax = Math.max(Math.floor(effectiveMax * 0.5), 1000);
    logInfo(
      `⚡ Proactive TPM reduction for ${provider.name}: effectiveMax halved to ${effectiveMax}`,
    );
  }

  // Apply cross-provider context budget cap from fallback chain.
  // When a previous provider reported a hard context limit (e.g. 413 / context_length_exceeded),
  // cap our budget so tool selection and message truncation fit within the known limit.
  // This prevents the same oversized tool payload from failing on every fallback provider.
  if (options.maxContextBudget && options.maxContextBudget < effectiveMax) {
    const previousMax = effectiveMax;
    effectiveMax = options.maxContextBudget;
    logInfo(
      `📉 Cross-provider context cap for ${provider.name}: ${previousMax} → ${effectiveMax} (fallback chain limit)`,
    );
  }

  // Select tools dynamically based on provider's FINAL context budget
  let activeTools = null;
  let activeToolCount = 0;
  let toolTier = "none";
  if (useTools) {
    const selected = selectToolsForProvider(effectiveMax);
    activeTools = selected.tools;
    activeToolCount = selected.toolCount;
    toolTier = selected.tier;
    if (toolTier === "minimal") {
      logInfo(
        `🔧 Minimal tools for ${provider.name}: context budget (${effectiveMax}) only fits minimal tier (${activeToolCount} tools)`,
      );
    } else {
      logInfo(
        `🔧 Tool tier for ${provider.name}: ${toolTier} (${activeToolCount} tools, budget: ${effectiveMax})`,
      );
    }
  }

  const toolOverheadTokens = useTools
    ? estimateToolOverheadTokens({ toolCount: activeToolCount })
    : 0;
  logDebug(`[invokeWithAI] Request token estimate`, {
    providerName: provider.name,
    estimatedInputTokens,
    toolOverheadTokens,
    estimatedRequestTokens: estimatedInputTokens + toolOverheadTokens,
    toolTier,
    activeToolCount,
  });
  const aiMessages = truncateMessagesForProvider(rawMessages, provider.name, {
    useTools,
    maxTokensOverride: effectiveMax,
    toolOverheadTokens,
  });
  logDebug(`[invokeWithAI] Messages after truncation`, {
    aiMessageCount: aiMessages?.length,
    providerName: provider.name,
    wasChanged: aiMessages?.length !== rawMessages?.length,
  });

  // Validation: truncateMessagesForProvider guarantees at least one message,
  // but double-check to catch any edge cases
  if (!aiMessages || aiMessages.length === 0) {
    logError(`❌ CRITICAL: Message truncation failed for provider ${provider.name}`, {
      originalMessageCount: messages?.length || 0,
      rawMessageCount: rawMessages?.length || 0,
      aiMessageCount: aiMessages?.length,
      providerName: provider.name,
    });
    throw new Error(
      `CRITICAL: Message truncation failed for provider ${provider.name} - original had ${messages?.length || 0} messages`,
    );
  }

  if (stream) {
    logDebug(`[invokeWithAI] Starting streaming invocation`, {
      providerName: provider.name,
      useTools,
      maxIterations: MAX_TOOL_ITERATIONS,
    });
    let finishReason = null;

    // Execution metrics for structured result contract (passed to runner via _symphonyResult)
    const executionMetrics = {
      mutationCount: 0,
      changedFiles: new Set(),
      taskCompleted: false,
      toolCallCount: 0,
      stepCount: 0,
      validationToolsRun: new Set(),
    };

    // Streaming with tool execution (tools disabled for providers that don't support them)
    const result = await streamText({
      model,
      messages: aiMessages,
      ...(useTools
        ? { tools: activeTools, toolChoice: "auto", stopWhen: stepCountIs(MAX_TOOL_ITERATIONS) }
        : {}),
      onStepFinish: (step) => {
        executionMetrics.stepCount++;
        if (step.toolCalls && step.toolCalls.length > 0) {
          for (const tc of step.toolCalls) {
            executionMetrics.toolCallCount++;
            const input = tc.input ?? tc.args;

            // Log tool call with resolved arguments (from tc.input after tool-input-delta accumulation)
            // This is the accurate representation of what the tool actually received
            const toolCallIndex = executionMetrics.toolCallCount;
            if (tc.toolName === "read") {
              logInfo(`🔧 ${tc.toolName}: (output suppressed)`);
              logDebug(`[invokeWithAI] Tool call #${toolCallIndex} resolved`, {
                toolName: tc.toolName,
                toolCallId: tc.toolCallId,
                argsKeys: input ? Object.keys(input) : [],
              });
            } else {
              const summary = input ? JSON.stringify(input).slice(0, 200) : "(no args)";
              logInfo(`🔧 ${tc.toolName}: ${summary}`);
              logDebug(`[invokeWithAI] Tool call #${toolCallIndex} resolved`, {
                toolName: tc.toolName,
                toolCallId: tc.toolCallId,
                argsKeys: input ? Object.keys(input) : [],
                stepNumber: executionMetrics.stepCount,
                providerName: provider.name,
              });
            }

            // Track mutations (write, write_file, str_replace, apply_patch)
            if (
              tc.toolName === "write" ||
              tc.toolName === "write_file" ||
              tc.toolName === "str_replace" ||
              tc.toolName === "apply_patch"
            ) {
              executionMetrics.mutationCount++;
              const filePath = input?.path || input?.operation?.path;
              if (filePath) executionMetrics.changedFiles.add(filePath);
              if (getCurrentRequestId()) trackFileChange(getCurrentRequestId());
            }

            // Track validation tool usage
            if (
              tc.toolName === "run_typecheck" ||
              tc.toolName === "run_lint" ||
              tc.toolName === "run_cspell" ||
              tc.toolName === "run_ast_density" ||
              tc.toolName === "run_tests"
            ) {
              executionMetrics.validationToolsRun.add(tc.toolName);
            }

            // Track task completion signal
            if (tc.toolName === "task_completed") {
              executionMetrics.taskCompleted = true;
            }
          }
        }
      },
      onFinish: (event) => {
        finishReason = event.finishReason;
        logInfo(`[invokeWithAI] Stream finished`, {
          finishReason,
          textLength: event.text?.length || 0,
          hasUsage: !!event.usage,
          inputTokens: event.usage?.promptTokens,
          outputTokens: event.usage?.completionTokens,
        });
        if (finishReason === "error" || !event.text) {
          logWarn(
            `⚠️ Stream finished: reason=${finishReason}, text=${event.text?.length || 0} chars`,
            { finishReason, textLength: event.text?.length || 0 },
          );
        }
        // Note: The step limit warning is handled after the stream loop (line ~2085)
        // because errorCount is not yet available in onFinish callback.
      },
    });

    // Process the full stream — includes reasoning, text, tool-call, and tool-result events
    let fullText = "";
    let fullTextCapped = false;
    let streamErrorDetail = null;
    let fatalStreamError = null;
    let hasTextDeltas = false;
    let hasMeaningfulText = false; // Track if we got any meaningful content (text-delta OR reasoning-delta)
    let partCount = 0;
    let textDeltaCount = 0;
    let toolCallCount = 0;
    let errorCount = 0;
    let emittedReasoningContent = false; // Track if we actually emitted reasoning content

    logDebug(`[invokeWithAI] Processing fullStream...`);

    // Track <think> blocks in text-delta for models that embed reasoning in text
    let inThinkBlock = false;

    // Track empty reasoning-delta events to suppress log spam
    let emptyReasoningDeltaCount = 0;

    // Raw JSON guard — buffer early text-delta content to detect providers
    // that emit tool calls as raw JSON text before forwarding to Discord
    let rawJsonGuardBuffer = "";
    let rawJsonGuardDone = !useTools; // Skip guard when tools aren't in use
    let rawJsonGuardFailed = false;
    const RAW_JSON_GUARD_THRESHOLD = 150;

    for await (const part of result.fullStream) {
      partCount++;

      // Build detailed log context based on part type
      const logContext = { type: part.type };

      // Check for empty deltas to suppress log spam (both text-delta and reasoning-delta)
      const deltaText = part.textDelta || "";
      const isEmptyTextDelta = part.type === "text-delta" && deltaText.length === 0;
      const isEmptyReasoningDelta = part.type === "reasoning-delta" && deltaText.length === 0;
      const isEmptyDelta = isEmptyTextDelta || isEmptyReasoningDelta;

      // DIAGNOSTIC: Log non-empty events only, and use DEBUG (not INFO) to prevent log flood
      if (provider.name !== "codebuff" && provider.name !== "codex" && !isEmptyDelta) {
        logDebug(`🔍 [${provider.name}] Stream event: ${part.type}`, {
          type: part.type,
          hasTextDelta: !!part.textDelta,
          hasToolName: !!part.toolName,
          preview: deltaText.slice(0, 50) || part.toolName || "",
        });
      }

      // Track empty delta counts and skip processing for empty deltas
      if (isEmptyReasoningDelta) {
        emptyReasoningDeltaCount++;
        continue; // Skip further processing for empty reasoning-delta
      }

      // Track empty text-delta and skip processing
      if (isEmptyTextDelta) {
        continue; // Skip empty text-delta
      }

      if (part.type === "text-delta") {
        const deltaText = part.textDelta || "";
        logContext.length = deltaText.length;
        logContext.preview = deltaText.slice(0, 100);
        hasTextDeltas = true;
        if (deltaText.length > 0) hasMeaningfulText = true;
        textDeltaCount++;
      } else if (part.type === "tool-call") {
        logContext.toolName = part.toolName;
        logContext.toolCallId = part.toolCallId;
        if (part.args) {
          logContext.argsPreview = JSON.stringify(part.args).slice(0, 100);
        }
      } else if (part.type === "tool-result") {
        logContext.toolName = part.toolName;
        logContext.toolCallId = part.toolCallId;
        if (part.result) {
          const resultStr =
            typeof part.result === "string" ? part.result : JSON.stringify(part.result);
          logContext.resultPreview = resultStr.slice(0, 100);
        }
      } else if (part.type === "reasoning-delta") {
        const deltaText = part.textDelta || "";
        logContext.length = deltaText.length;
        logContext.preview = deltaText.slice(0, 100);
        // CRITICAL FIX: Only log non-empty reasoning-delta events to prevent log spam
        // from infinite empty reasoning-delta loops (ANQ-XXX)
        if (deltaText.length > 0) {
          logInfo(`💡 [${provider.name}] reasoning-delta event detected`, {
            length: deltaText.length,
            preview: deltaText.slice(0, 100),
          });
        }
      } else if (part.type === "reasoning-start") {
        logInfo(`💡 [${provider.name}] reasoning-start event`, { providerName: provider.name });
      } else if (part.type === "reasoning-end") {
        logInfo(`💡 [${provider.name}] reasoning-end event`, { providerName: provider.name });
      } else if (part.type === "error") {
        const errorMsg = errorToString(part.error || part);
        logContext.errorPreview = errorMsg.slice(0, 150);
      } else if (part.type === "finish") {
        logContext.finishReason = part.finishReason;
      }

      // Suppress blank DEBUG lines (text-delta or reasoning-delta with length 0)
      // Reuse isEmptyTextDelta already defined at line 3831
      if (!isEmptyTextDelta && !isEmptyReasoningDelta) {
        logDebug(`[invokeWithAI] Stream part ${partCount}`, logContext);
      }

      // Process stream parts based on type
      if (part.type === "reasoning-start") {
        // Emit thinking indicator when reasoning starts
        if (!rawJsonGuardFailed && onChunk) {
          onChunk({ type: "text", text: "\n💭 " });
        }
      } else if (part.type === "reasoning-delta") {
        // CRITICAL BUG FIX (ANQ-XXX): Accumulate reasoning-delta into fullText
        // Previously, reasoning-delta was only forwarded to onChunk but never
        // accumulated, causing "Stream completed but produced no content" errors
        // when models send reasoning via reasoning-delta instead of text-delta.
        // This is the root cause of the OpenRouter streaming failures.
        const reasoningDelta = part.textDelta || "";
        if (reasoningDelta && reasoningDelta.length > 0) {
          hasMeaningfulText = true; // Track meaningful reasoning content
          emittedReasoningContent = true; // Mark that we actually got reasoning
          // Accumulate into fullText (same as text-delta)
          if (!fullTextCapped) {
            if (fullText.length + reasoningDelta.length > MAX_RESPONSE_TEXT_BYTES) {
              fullTextCapped = true;
              logWarn(`⚠️ fullText capped at ${MAX_RESPONSE_TEXT_BYTES} bytes (reasoning-delta)`, {
                currentLength: fullText.length,
                deltaLength: reasoningDelta.length,
                maxBytes: MAX_RESPONSE_TEXT_BYTES,
              });
            } else {
              fullText += reasoningDelta;
            }
          }
          // Forward to client for streaming
          if (!rawJsonGuardFailed && onChunk) {
            onChunk({ type: "text", text: reasoningDelta });
          }
        }
      } else if (part.type === "reasoning-end") {
        // Only emit newline if we actually got reasoning content
        if (emittedReasoningContent && !rawJsonGuardFailed && onChunk) {
          onChunk({ type: "text", text: "\n" });
        }
      } else if (part.type === "text-delta") {
        const delta = part.textDelta || "";
        if (!fullTextCapped) {
          if (fullText.length + delta.length > MAX_RESPONSE_TEXT_BYTES) {
            fullTextCapped = true;
            logWarn(`⚠️ fullText capped at ${MAX_RESPONSE_TEXT_BYTES} bytes`, {
              currentLength: fullText.length,
              deltaLength: delta.length,
              maxBytes: MAX_RESPONSE_TEXT_BYTES,
            });
          } else {
            fullText += delta;
          }
        }

        // Detect <think> blocks for models that embed reasoning in text
        // (e.g., Qwen, DeepSeek, and other models that don't emit reasoning-delta events)
        // Simple boundary detection - handles multi-chunk blocks correctly
        if (delta.includes("<think>")) {
          if (!inThinkBlock) {
            inThinkBlock = true;
            // Emit newline when thinking starts (no emoji for Discord)
            if (!rawJsonGuardFailed && onChunk) onChunk({ type: "text", text: "\n" });
            logInfo(`💭 [${provider.name}] <think> block start detected in text-delta`, {
              providerName: provider.name,
              deltaPreview: delta.slice(0, 100),
            });
          }
        }

        // Forward non-empty text deltas — guarded against raw JSON tool output.
        // Buffer early chars to detect raw JSON before any content reaches Discord.
        if (delta && delta.length > 0) {
          if (!rawJsonGuardDone) {
            rawJsonGuardBuffer += delta;
            if (rawJsonGuardBuffer.length >= RAW_JSON_GUARD_THRESHOLD) {
              if (RAW_TOOL_JSON_RE.test(rawJsonGuardBuffer)) {
                rawJsonGuardFailed = true;
                rawJsonGuardDone = true;
                nonToolCapableProviders.add(provider.name);
                logWarn(`⚠️ ${provider.name} streaming raw JSON tool calls — suppressing output`);
              } else {
                rawJsonGuardDone = true;
                if (onChunk) onChunk({ type: "text", text: rawJsonGuardBuffer });
              }
            }
          } else if (!rawJsonGuardFailed && onChunk) {
            onChunk({ type: "text", text: delta });
          }
        }

        if (delta.includes("</think>")) {
          if (inThinkBlock) {
            inThinkBlock = false;
            // Emit newline when thinking ends
            if (!rawJsonGuardFailed && onChunk) onChunk({ type: "text", text: "\n" });
            logInfo(`💭 [${provider.name}] <think> block end detected in text-delta`, {
              providerName: provider.name,
            });
          }
        }

        // Log non-empty text-delta events for debugging (first 200 chars)
        if (delta && delta.length > 0) {
          logDebug(`📨 text-delta (${delta.length} chars): ${delta.slice(0, 200)}`, {
            deltaLength: delta.length,
            totalLength: fullText.length,
            inThinkBlock,
          });
        }
      } else if (part.type === "tool-call") {
        toolCallCount++;
        // Note: At this point, part.args may be empty because args are streamed separately
        // via tool-input-delta events. The actual resolved arguments are available in
        // onStepFinish where we log using tc.input (which has the final resolved args).
        // We log a placeholder here and the real logging happens in onStepFinish.
        logDebug(`[invokeWithAI] Tool call ${toolCallCount}`, {
          toolName: part.toolName,
          toolCallId: part.toolCallId,
          note: "args populated via tool-input-delta, see onStepFinish for resolved input",
        });
        // Tool activity messages are logged server-side but NOT sent to client/Discord
        // to avoid noise in Discord notifications
      } else if (part.type === "tool-result") {
        logInfo(`✅ ${part.toolName} done`);
        logDebug(`[invokeWithAI] Tool result`, {
          toolName: part.toolName,
          toolCallId: part.toolCallId,
          hasResult: !!part.result,
          resultType: typeof part.result,
        });
        // Tool activity messages are logged server-side but NOT sent to client/Discord
        // to avoid noise in Discord notifications
      } else if (part.type === "error") {
        errorCount++;
        const streamError = part.error || part;
        const rootError = unwrapAIError(streamError);
        const errorMsg = errorToString(rootError);
        streamErrorDetail = streamErrorDetail || errorMsg;

        // Dynamic tool-capability learning from stream errors: if the error
        // indicates the provider cannot satisfy the runtime's tool-choice
        // contract, exclude it from tool paths for this process lifetime.
        const toolErrOutcome = classifyToolProbeErrorOutcome(errorMsg);
        if (
          toolErrOutcome.status === "non-capable-rejected" ||
          toolErrOutcome.status === "failed-function-call"
        ) {
          nonToolCapableProviders.add(provider.name);
          logWarn(
            `🔧 ${provider.name} dynamically excluded from tool paths (stream: ${toolErrOutcome.status})`,
          );
        }

        // Log server-side only - internal provider errors are handled by auto-fallback
        const streamErrType = classifyError(rootError);
        const streamIsRetryable =
          streamError?.retryable === true ||
          isRetryableErrorDeep(streamError) ||
          [
            ERROR_TYPES.CONTEXT_TOO_LARGE,
            ERROR_TYPES.RATE_LIMITED,
            ERROR_TYPES.TIMEOUT,
            ERROR_TYPES.SERVER_ERROR,
          ].includes(streamErrType);
        logWarn(
          `🔧 Internal provider error (auto-fallback will retry): ${errorMsg.slice(0, 150)}`,
          {
            providerName: provider.name,
            errorType: streamError?.constructor?.name,
            isRetryable: streamIsRetryable,
          },
        );
        logDebug(`[invokeWithAI] Stream error ${errorCount}`, {
          errorMsg: errorMsg.slice(0, 500),
          errorType: streamError?.constructor?.name,
          hasResponseBody: !!rootError?.responseBody,
          statusCode: rootError?.statusCode,
          classifiedErrorType: streamErrType,
          isRetryable: streamIsRetryable,
        });
        if (
          !fatalStreamError &&
          [
            ERROR_TYPES.CONTEXT_TOO_LARGE,
            ERROR_TYPES.RATE_LIMITED,
            ERROR_TYPES.TIMEOUT,
            ERROR_TYPES.SERVER_ERROR,
          ].includes(streamErrType)
        ) {
          rootError.retryable = true;
          fatalStreamError = rootError;
          logInfo(
            `🚨 Fatal stream error (${streamErrType}): will throw after stream completes to trigger adaptive context + fallback`,
            {
              providerName: provider.name,
              errorType: streamErrType,
              statusCode: rootError?.statusCode,
            },
          );
        }
        if (
          !fatalStreamError &&
          (streamErrType === ERROR_TYPES.CONTEXT_TOO_LARGE ||
            streamErrType === ERROR_TYPES.RATE_LIMITED)
        ) {
          fatalStreamError = rootError;
          logInfo(
            `🚨 Fatal stream error (${streamErrType}): will throw after stream completes to trigger adaptive context + fallback`,
            {
              providerName: provider.name,
              errorType: streamErrType,
              statusCode: rootError?.statusCode,
            },
          );
        }
        // DO NOT forward error events to client - these are internal Symphony routing errors
      } else if (part.type === "finish") {
        if (part.finishReason) {
          finishReason = part.finishReason;
        }
        logDebug(`[invokeWithAI] Finish event`, { finishReason: part.finishReason });
      }
    }

    logInfo(`[invokeWithAI] Stream processing complete`, {
      partCount,
      textDeltaCount,
      toolCallCount,
      errorCount,
      finalTextLength: fullText.length,
      hasTextDeltas,
      finishReason,
      hasFatalStreamError: !!fatalStreamError,
      emptyReasoningDeltaCount,
    });

    // Flush remaining raw JSON guard buffer (stream ended before threshold)
    if (!rawJsonGuardDone && rawJsonGuardBuffer.length > 0) {
      if (RAW_TOOL_JSON_RE.test(rawJsonGuardBuffer)) {
        rawJsonGuardFailed = true;
      } else if (onChunk) {
        onChunk({ type: "text", text: rawJsonGuardBuffer });
      }
      rawJsonGuardDone = true;
    }

    // Summary of suppressed empty reasoning-delta events
    if (emptyReasoningDeltaCount > 0) {
      logDebug(`[${provider.name}] Suppressed empty reasoning-delta events`, {
        count: emptyReasoningDeltaCount,
      });
    }

    // If stream contained a fatal error (413/context or 429/rate-limit), throw
    // the original error to trigger adaptive context recording and provider
    // fallback in the invokeWithFallbackStream catch block
    if (fatalStreamError) {
      throw fatalStreamError;
    }

    // Fallback: if fullStream produced no meaningful content (text-delta OR reasoning-delta), try result.text
    // (best-effort — result.text derives from the same stream, but internal
    // accumulation may differ for some provider SDKs)
    //
    // For Codebuff: AI SDK buffers activity messages ("✅ done", "🔧 read:") and only
    // exposes them via result.text at the end. This is expected behavior - the AI SDK
    // only emits text-delta for model-generated text, not for SDK activity metadata.
    //
    // FIX: Check hasMeaningfulText instead of hasTextDeltas to handle reasoning-only streams
    // where content comes via reasoning-delta events instead of text-delta.
    if (!hasMeaningfulText || !fullText || fullText.trim() === "") {
      try {
        const fallbackText = await result.text;
        if (fallbackText && fallbackText.trim()) {
          if (!hasTextDeltas) {
            logDebug(
              `⚠️ fullStream produced no text-delta events (${provider.name} buffered), recovered ${fallbackText.length} chars from result.text`,
            );
          }
          fullText = fallbackText;
          // Early rejection: detect raw JSON tool calls before forwarding to Discord
          if (useTools && RAW_TOOL_JSON_RE.test(fallbackText)) {
            nonToolCapableProviders.add(provider.name);
            const rawJsonErr = new Error(
              `${provider.name} emitted tool call as raw JSON text — rejecting response`,
            );
            rawJsonErr.code = "RAW_TOOL_JSON_TEXT";
            rawJsonErr.retryable = true;
            throw rawJsonErr;
          }
          // Forward the fallback text in smaller chunks to simulate streaming
          if (onChunk) {
            const CHUNK_SIZE = 50; // Forward in 50-char chunks for better real-time appearance
            for (let i = 0; i < fallbackText.length; i += CHUNK_SIZE) {
              const chunk = fallbackText.slice(i, i + CHUNK_SIZE);
              onChunk({ type: "text", text: chunk });
              // Small delay to prevent overwhelming the client (2ms = ~25KB/s)
              await sleep(2);
            }
          }
        }
      } catch (error_) {
        // result.text can also throw AI_NoOutputGeneratedError — don't mask the original issue
        logDebug(`⚠️ result.text fallback also failed: ${String(error_).slice(0, 100)}`);
      }
    }

    // Check for embedded errors — some providers return 200 with error in body
    // CHANGED: Distinguish between truly no output vs stream errors with partial output.
    // - hasMeaningfulText=false + errorCount=0: truly no output generated (retryable)
    // - hasMeaningfulText=false + errorCount>0: stream error produced an error part (retryable, but different classification)
    // - hasMeaningfulText=true: content was produced, don't treat as no-output
    const hasAnyOutput = hasMeaningfulText || (fullText && fullText.trim() !== "");
    if (!hasAnyOutput && finishReason !== "tool-calls") {
      // Distinguish error cases for better debugging
      const outputClassification =
        errorCount > 0
          ? `stream_error_with_output: parts=${partCount}, errors=${errorCount}`
          : `no_output_generated: provider=${provider.name}, finishReason=${finishReason ?? "null"}, parts=${partCount}, errors=${errorCount}, hasMeaningfulText=${hasMeaningfulText}`;

      const noOutputError = new Error(outputClassification);
      noOutputError.code = errorCount > 0 ? "STREAM_ERROR_WITH_OUTPUT" : "NO_OUTPUT_GENERATED";
      noOutputError.providerName = provider.name;
      noOutputError.finishReason = finishReason ?? null;
      noOutputError.retryable = true; // Mark as retryable for fallback selection
      noOutputError.hasErrors = errorCount > 0; // Flag for downstream handling

      // Log with appropriate severity - stream errors with output are more informative
      if (errorCount > 0) {
        logWarn(
          `⚠️ Stream produced error parts but no text content (finishReason: ${finishReason}) — treating as retryable provider failure`,
          { providerName: provider.name, partCount, errorCount, hasMeaningfulText },
        );
      } else {
        logWarn(
          `⚠️ Stream completed but produced no meaningful content (finishReason: ${finishReason}) — treating as retryable provider failure`,
          { providerName: provider.name, partCount, errorCount, hasMeaningfulText },
        );
      }
      throw noOutputError;
    }
    if (finishReason === "error") {
      logError(
        `Stream finished with error: ${streamErrorDetail || "unknown"} (text: ${fullText.length} chars)`,
      );
      throw new Error(
        `Stream finished with error: ${streamErrorDetail || "unknown"} (text: ${fullText.length} chars)`,
      );
    }

    // Handle truncated responses — but distinguish between actual step limit vs API errors
    // CRITICAL FIX: When stream ends during tool execution due to API errors (errorCount > 0),
    // we MUST throw to trigger provider fallback. The partial results are not reliable.
    if (finishReason === "tool-calls" && errorCount > 0) {
      const truncatedError = new Error(
        `Response truncated: the stream ended during tool execution due to API error(s). The results above may be incomplete. (provider: ${provider.name}, errors: ${errorCount})`,
      );
      truncatedError.code = "STREAM_TRUNCATED_WITH_ERRORS";
      truncatedError.providerName = provider.name;
      truncatedError.retryable = true;
      truncatedError.errorCount = errorCount;
      // Throw to trigger provider fallback - don't return partial results
      throw truncatedError;
    }

    // Handle step limit case (no errors, model still working but hit step limit)
    if (finishReason === "tool-calls" && errorCount === 0) {
      const truncationNote =
        "\n\n---\n⚠️ Response truncated: the model was still working when it reached the tool-execution step limit. The results above may be incomplete.";
      fullText += truncationNote;
      if (onChunk) {
        onChunk({ type: "text", text: truncationNote });
      }
    }

    // Check response for embedded error metadata
    const response = await result.response;
    if (response && typeof response === "object") {
      const hasErrorSymbol =
        response[Symbol.for("vercel.ai.error")] ||
        response[Symbol.for("vercel.ai.error.AI_APICallError")];
      if (hasErrorSymbol) {
        logError(`Response contains embedded error`);
        throw new Error(`Response contains embedded error`);
      }
    }

    if (
      isInvalidModelAnswerText(fullText, {
        allowSentinel: process.env.SYMPHONY_ALLOW_NO_REPLY_SENTINEL === "1",
      })
    ) {
      const invalidResponseError = new Error(`Invalid sentinel response from ${provider.name}`);
      invalidResponseError.code = "INVALID_SENTINEL_RESPONSE";
      invalidResponseError.providerName = provider.name;
      invalidResponseError.retryable = true;
      throw invalidResponseError;
    }

    // Runtime safety net (streaming): reject raw JSON tool output and trigger provider fallback.
    // The guard buffer suppresses forwarding for short responses; for longer ones where some
    // text-delta content was already streamed, the fallback handler cleans up the Discord preview.
    if (useTools && (rawJsonGuardFailed || (fullText && RAW_TOOL_JSON_RE.test(fullText)))) {
      nonToolCapableProviders.add(provider.name);
      const rawJsonErr = new Error(
        `${provider.name} emitted tool calls as raw JSON text — rejecting response`,
      );
      rawJsonErr.code = "RAW_TOOL_JSON_TEXT";
      rawJsonErr.retryable = true;
      throw rawJsonErr;
    }

    logDebug(`Streaming completed (${fullText.length} chars)`);

    // Build structured result contract for runner/agent consumption
    const _symphonyResult = {
      completed: executionMetrics.taskCompleted === true,
      needsContinuation: finishReason === "tool-calls" || finishReason === "length",
      failureClass:
        errorCount > 0
          ? "stream_error"
          : finishReason === "tool-calls"
            ? "step_limit_reached"
            : null,
      mutationCount: executionMetrics.mutationCount,
      changedFiles: [...executionMetrics.changedFiles],
      validationIntent: executionMetrics.validationToolsRun.size > 0,
      toolCallCount: executionMetrics.toolCallCount,
      stepCount: executionMetrics.stepCount,
    };

    // CHANGED: Return the recovered fullText (which may have been populated via
    // result.text fallback), not rely on result.text being consistently populated
    // after stream recovery. This removes the mismatch between recovered text
    // and returned text.
    return {
      text: fullText,
      providerName: provider.name,
      usage: result.response?.usage,
      _symphonyResult,
    };
  } else {
    // Non-streaming with tool execution (tools disabled for providers that don't support them)
    const result = await generateText({
      model,
      messages: aiMessages,
      ...(useTools
        ? { tools: activeTools, toolChoice: "auto", stopWhen: stepCountIs(MAX_TOOL_ITERATIONS) }
        : {}),
    });

    let text = result.text || "";

    // Non-streaming: check if there were errors during generateText
    // Note: For non-streaming, we don't have per-event error tracking, but we can check
    // if the result.text indicates issues. The "tool-calls" finish reason on non-streaming
    // is more likely to be an actual step limit (generateText doesn't surface individual errors).
    if (result.finishReason === "tool-calls") {
      logWarn(
        `⚠️ Model hit step limit (${MAX_TOOL_ITERATIONS}) while still executing tools — response may be truncated`,
      );
      text +=
        "\n\n---\n⚠️ Response truncated: the model was still working when it reached the tool-execution step limit. The results above may be incomplete.";
    }

    if (
      isInvalidModelAnswerText(text, {
        allowSentinel: process.env.SYMPHONY_ALLOW_NO_REPLY_SENTINEL === "1",
      })
    ) {
      const invalidResponseError = new Error(`Invalid sentinel response from ${provider.name}`);
      invalidResponseError.code = "INVALID_SENTINEL_RESPONSE";
      invalidResponseError.providerName = provider.name;
      invalidResponseError.retryable = true;
      throw invalidResponseError;
    }

    // Runtime safety net (non-streaming): detect raw JSON tool output and cascade to next provider
    if (useTools && text && RAW_TOOL_JSON_RE.test(text)) {
      logWarn(
        `⚠️ ${provider.name} emitted tool calls as raw JSON text — marking as non-tool-capable`,
      );
      nonToolCapableProviders.add(provider.name);
      throw new Error(
        `Provider ${provider.name} does not support structured tool calling — excluded`,
      );
    }

    logDebug(`Completion done`);

    // Build structured result contract (simplified for non-streaming - no tool execution metrics)
    const _symphonyResult = {
      completed: false,
      needsContinuation: result.finishReason === "tool-calls" || result.finishReason === "length",
      failureClass: result.finishReason === "tool-calls" ? "step_limit_reached" : null,
      mutationCount: 0,
      changedFiles: [],
      validationIntent: false,
      toolCallCount: 0,
      stepCount: 0,
    };

    return {
      text,
      providerName: provider.name,
      usage: result.usage,
      _symphonyResult,
    };
  }
}
