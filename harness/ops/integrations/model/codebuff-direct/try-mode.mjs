import { inferSymphonyResultFromCompletion } from "../../../core/bridge-result.mjs";

import { CODEBUFF_MAX_CONTINUATIONS } from "./codebuff-max-continuations.mjs";
import { CODEBUFF_MAX_STEPS } from "./codebuff-max-steps.mjs";
import { CODEBUFF_MODEL_ID } from "./codebuff-model-id.mjs";
import { CODEBUFF_NOISY_TOOLS } from "./codebuff-noisy-tools.mjs";
import { ensureNoSdkError } from "./ensure-no-sdk-error.mjs";
import { extractText } from "./extract-text.mjs";
import { getSharedClient } from "./get-shared-client.mjs";
import { makeTimeout } from "./make-timeout.mjs";
import { runClientQuietly } from "./run-client-quietly.mjs";
import { logDebug, logInfo, logWarn } from "./logger.mjs";

export async function tryMode(apiKey, cwd, costMode, prompt, onTextChunk = null) {
  const client = getSharedClient(apiKey, costMode, cwd);
  let lastSubgoalStatus = null;
  let streamedText = "";
  const usedTools = new Set();

  const handleEvent = (event) => {
    try {
      if (!event || !event.type) return;
      if (event.type === "text") return;
      if (event.type === "tool_call" || event.type === "tool-call") {
        const toolName = event.toolName || event.name || "unknown";
        usedTools.add(toolName);
        if (toolName === "update_subgoal") {
          lastSubgoalStatus = event.input?.status || lastSubgoalStatus;
        }
        if (toolName === "add_subgoal") {
          lastSubgoalStatus = event.input?.status || "IN_PROGRESS";
        }
        if (!CODEBUFF_NOISY_TOOLS.has(toolName)) {
          logDebug(`[codebuff-direct] tool ${toolName}`);
        }
      } else if (event.type === "error") {
        const msg = event.message || JSON.stringify(event);
        logWarn(`[codebuff-direct] event error: ${String(msg).slice(0, 200)}`);
      }
    } catch (err) {
      logDebug(`[codebuff-direct] handleEvent failed: ${err.message}`);
    }
  };

  const handleStreamChunk = (chunk) => {
    try {
      const text = typeof chunk === "string" ? chunk : chunk?.chunk;
      if (!text) return;
      streamedText += text;
      if (onTextChunk) onTextChunk(text);
    } catch (err) {
      logDebug(`[codebuff-direct] handleStreamChunk failed: ${err.message}`);
    }
  };

  const runOpts = {
    agent: CODEBUFF_MODEL_ID,
    prompt,
    maxAgentSteps: CODEBUFF_MAX_STEPS,
    handleEvent,
    handleStreamChunk,
  };
  if (costMode) runOpts.costMode = costMode;

  let result = await Promise.race([runClientQuietly(client, runOpts), makeTimeout()]);
  ensureNoSdkError(result.output);

  let continuation = 0;
  while (continuation < CODEBUFF_MAX_CONTINUATIONS && lastSubgoalStatus === "IN_PROGRESS") {
    continuation += 1;
    logInfo(
      `[codebuff-direct] auto-continue ${continuation}/${CODEBUFF_MAX_CONTINUATIONS} (${costMode || "paid"})`,
    );
    const contOpts = {
      agent: CODEBUFF_MODEL_ID,
      prompt: "Continue with the next step of the task. Complete the remaining work.",
      previousRun: result,
      maxAgentSteps: CODEBUFF_MAX_STEPS,
      handleEvent,
      handleStreamChunk,
    };
    if (costMode) contOpts.costMode = costMode;
    result = await Promise.race([runClientQuietly(client, contOpts), makeTimeout()]);
    ensureNoSdkError(result.output);
  }

  const text = extractText(streamedText || result.output);
  const needsContinuation = lastSubgoalStatus === "IN_PROGRESS";
  const finishReason = needsContinuation ? "length" : "stop";

  return {
    text,
    mode: costMode ? "free" : "paid",
    needsContinuation,
    hasSubgoals: lastSubgoalStatus !== null,
    usedTools: [...usedTools],
    finishReason,
    _symphonyResult: {
      completed: !needsContinuation,
      needsContinuation,
      failureClass: needsContinuation ? "step_limit_reached" : null,
      mutationCount: usedTools.size,
      changedFiles: [],
      validationIntent: false,
      toolCallCount: usedTools.size,
      stepCount: 0,
    },
  };
}
