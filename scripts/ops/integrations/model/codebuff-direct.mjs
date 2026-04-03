#!/usr/bin/env node

/**
 * codebuff-direct.mjs — Worktree-local Codebuff SDK execution for Symphony
 *
 * This replaces the old root-scoped codebuff bridge service.
 * Every invocation is bound to the caller's worktree cwd.
 */

import { CodebuffClient } from "@codebuff/sdk";
import { createLogger } from "../../lib/logger.mjs";
import { inferSymphonyResultFromCompletion } from "../../core/bridge-result.mjs";

const { logDebug, logInfo, logWarn } = createLogger();

const CODEBUFF_MODEL_ID = process.env.CODEBUFF_MODEL_ID || "codebuff/base";
const CODEBUFF_MAX_STEPS = Number(process.env.CODEBUFF_MAX_STEPS || 100);
const CODEBUFF_MAX_CONTINUATIONS = Number(process.env.CODEBUFF_MAX_CONTINUATIONS || 50);
const CODEBUFF_TIMEOUT_MS = Number(process.env.CODEBUFF_TIMEOUT_MS || 30 * 60 * 1000);

const TOOL_PARAMETER_RULES = `# Tool Parameter Format Rules
Array-typed parameters MUST be JSON arrays.
- read_files.paths => ["file.ts"]
- run_file_change_hooks.files => ["file.ts"]
- str_replace.replacements => [{"old":"a","new":"b"}]
- spawn_agents.agents => [{"agent_type":"basher","prompt":"...","params":{"command":"pwd"}}]
Do not pass strings where arrays are required.
`;

const CODEBUFF_NOISY_TOOLS = new Set([
  "set_messages",
  "set_output",
  "end_turn",
  "lookup_agent_info",
  "spawn_agent_inline",
  "spawn_agents",
  "context-pruner",
  "codebuff/context-pruner@0.0.29",
  "read_files",
  "read_subtree",
  "file-explorer",
  "codebuff/file-explorer@0.0.7",
  "file-picker",
  "codebuff/file-picker@0.0.5",
  "find-all-referencer",
  "codebuff/find-all-referencer@0.0.4",
]);

let sharedClient = null;
let sharedClientKey = null;

function makeTimeout() {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Codebuff timeout after ${CODEBUFF_TIMEOUT_MS}ms`)), CODEBUFF_TIMEOUT_MS);
  });
}

function normalizeCwd(cwd) {
  if (typeof cwd === "string" && cwd.trim()) return cwd.trim();
  return process.env.ANQR_WORKTREE_PATH || process.cwd();
}

function getApiKey() {
  return process.env.CODEBUFF_API_KEY || null;
}

export function getSharedClient(apiKey, costMode, cwd) {
  const normalizedCwd = normalizeCwd(cwd);
  const key = `${apiKey || ""}::${costMode || "paid"}::${normalizedCwd}`;
  if (sharedClient && sharedClientKey === key) {
    return sharedClient;
  }
  sharedClient = new CodebuffClient({
    apiKey,
    cwd: normalizedCwd,
    knowledgeFiles: {
      "tool-parameter-rules.knowledge.md": TOOL_PARAMETER_RULES,
    },
  });
  sharedClientKey = key;
  logDebug(`[codebuff-direct] created client`, {
    costMode: costMode || "paid",
    cwd: normalizedCwd,
  });
  return sharedClient;
}

export function resetSharedClient() {
  sharedClient = null;
  sharedClientKey = null;
}

function isRateLimitError(errStr) {
  const s = String(errStr || "").toLowerCase();
  return (
    s.includes("429") ||
    s.includes("rate_limit") ||
    s.includes("rate limit") ||
    s.includes("too many requests") ||
    s.includes("session limit") ||
    s.includes("weekly limit") ||
    s.includes("limit resets") ||
    s.includes("continue with credits")
  );
}

function isPaymentRequiredError(errStr) {
  const s = String(errStr || "").toLowerCase();
  return (
    s.includes("402") ||
    s.includes("payment required") ||
    s.includes("out of credits") ||
    s.includes("add credits") ||
    s.includes("insufficient credits")
  );
}

function isRecoverableError(errStr) {
  return isRateLimitError(errStr) || isPaymentRequiredError(errStr);
}

function ensureNoSdkError(resultOutput) {
  const str = typeof resultOutput === "string" ? resultOutput : JSON.stringify(resultOutput);
  if (str.includes("Symbol(vercel.ai.error)")) {
    const match = str.match(/"message":"([^"]+)"/);
    throw new Error(match ? match[1] : "Codebuff SDK error");
  }
  if (isRecoverableError(str)) {
    throw new Error(str);
  }
}

function extractTextFromUnknown(value, parts = []) {
  if (value == null) return parts;
  if (typeof value === "string") {
    if (value.trim()) parts.push(value);
    return parts;
  }
  if (Array.isArray(value)) {
    for (const item of value) extractTextFromUnknown(item, parts);
    return parts;
  }
  if (typeof value === "object") {
    const fields = ["text", "content", "reasoning", "result", "message", "output"];
    for (const field of fields) {
      if (field in value) extractTextFromUnknown(value[field], parts);
    }
    if (parts.length === 0) {
      for (const nested of Object.values(value)) {
        extractTextFromUnknown(nested, parts);
      }
    }
    return parts;
  }
  parts.push(String(value));
  return parts;
}

function extractText(output) {
  const parts = extractTextFromUnknown(output, []);
  const joined = parts
    .map((part) => String(part))
    .filter(Boolean)
    .join("\n")
    .trim();
  return joined;
}

function buildPrompt(messages) {
  return (messages || [])
    .map((message) => {
      const role = String(message?.role || "user").toUpperCase();
      const content =
        typeof message?.content === "string" ? message.content : JSON.stringify(message?.content);
      return `${role}:\n${content}`;
    })
    .join("\n\n");
}

async function tryMode(apiKey, cwd, costMode, prompt, onTextChunk = null) {
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

  let result = await Promise.race([client.run(runOpts), makeTimeout()]);
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
    result = await Promise.race([client.run(contOpts), makeTimeout()]);
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
    _symphonyResult:
      inferSymphonyResultFromCompletion({
        finishReason,
        text,
      }) || {
        completed: !needsContinuation,
        needsContinuation,
        failureClass: null,
        mutationCount: 0,
        changedFiles: [],
        validationIntent: false,
        toolCallCount: usedTools.size,
        stepCount: 0,
      },
  };
}

export async function invokeCodebuffDirect({ messages, cwd }) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("CODEBUFF_API_KEY is not set");
  }

  const normalizedCwd = normalizeCwd(cwd);
  const prompt = buildPrompt(messages);

  try {
    return await tryMode(apiKey, normalizedCwd, undefined, prompt, null);
  } catch (err) {
    const errStr = err?.message || String(err);
    if (!isRecoverableError(errStr)) throw err;
    logWarn(`[codebuff-direct] paid mode failed, retrying free mode: ${errStr.slice(0, 160)}`);
    return tryMode(apiKey, normalizedCwd, "free", prompt, null);
  }
}

export async function invokeCodebuffDirectStream({ messages, cwd, onTextChunk }) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("CODEBUFF_API_KEY is not set");
  }

  const normalizedCwd = normalizeCwd(cwd);
  const prompt = buildPrompt(messages);

  try {
    return await tryMode(apiKey, normalizedCwd, undefined, prompt, onTextChunk);
  } catch (err) {
    const errStr = err?.message || String(err);
    if (!isRecoverableError(errStr)) throw err;
    logWarn(`[codebuff-direct] paid mode failed during stream, retrying free mode: ${errStr.slice(0, 160)}`);
    return tryMode(apiKey, normalizedCwd, "free", prompt, onTextChunk);
  }
}
