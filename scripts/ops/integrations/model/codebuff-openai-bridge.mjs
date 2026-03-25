#!/usr/bin/env node

/**
 * codebuff-openai-bridge.mjs — OpenAI-compatible HTTP gateway for Codebuff SDK
 *
 * Exposes:
 *   GET  /v1/models       — List available models
 *   POST /v1/chat/completions — Chat completion (streaming & non-streaming)
 *
 * Designed for OpenClaw integration as a custom provider.
 *
 * Usage:
 *   node codebuff-openai-bridge.mjs [--port 4318]
 *
 * Environment:
 *   CODEBUFF_BRIDGE_PORT      — Port to listen on (default: 4318)
 *   CODEBUFF_BRIDGE_API_KEY   — Bearer token for auth (default: local-bridge)
 *   CODEBUFF_MODEL_ID         — Model ID to advertise (default: codebuff/base)
 *   CODEBUFF_BRIDGE_CWD       — Working directory for Codebuff (default: project root)
 *   CODEBUFF_API_KEY          — Required: Codebuff API key (uses paid mode first, then free mode)
 */

import http from "node:http";
import https from "node:https";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CodebuffClient } from "@codebuff/sdk";
import { isTextUIPart, isReasoningUIPart, isToolUIPart, isDataUIPart } from "ai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../../../../");

const PORT = process.env.CODEBUFF_BRIDGE_PORT || 4318;
const API_KEY = process.env.CODEBUFF_BRIDGE_API_KEY || "local-bridge";
const MODEL_ID = process.env.CODEBUFF_MODEL_ID || "codebuff/base";
const TIMEOUT_MS = 120 * 60 * 1000; // 120 min to match RUNNER_MAX_EXECUTION_MS from symphony-config
const DEFAULT_CWD = process.env.CODEBUFF_BRIDGE_CWD || PROJECT_ROOT;

// OpenClaw Gateway API configuration for tool proxying
const OPENCLAW_GATEWAY_HOST = process.env.OPENCLAW_GATEWAY_HOST || "127.0.0.1";
const OPENCLAW_GATEWAY_PORT = process.env.OPENCLAW_GATEWAY_PORT || 18789;
const OPENCLAW_GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || `http://${OPENCLAW_GATEWAY_HOST}:${OPENCLAW_GATEWAY_PORT}`;
const OPENCLAW_GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || null;
const OPENCLAW_TOOL_PROXY_ENABLED = process.env.OPENCLAW_TOOL_PROXY_ENABLED !== "false";

// Validate config on startup
if (OPENCLAW_TOOL_PROXY_ENABLED && !OPENCLAW_GATEWAY_TOKEN) {
  console.warn("[bridge] ⚠️ OPENCLAW_TOOL_PROXY_ENABLED=true but OPENCLAW_GATEWAY_TOKEN not set - tool proxying will fail");
}

const CODEBUFF_MAX_STEPS = 200; // Codebuff SDK has internal context pruning; cap to limit memory
const CODEBUFF_MAX_CONTINUATIONS = 200; // Max auto-continue loops when agent ends turn with work remaining
const CODEBUFF_NOISY_TOOLS = new Set([
  "set_messages",
  "set_output",
  "end_turn",
  "lookup_agent_info",
  "spawn_agent_inline",
  "context-pruner",
]);
const maybeGC = typeof global.gc === "function" ? () => global.gc() : () => {};

// OpenClaw-specific tools that should be proxied to the Gateway API
// Note: These are checked but not yet fully integrated - tool proxying is in progress
const _OPENCLAW_PROXY_TOOLS = [
  "message",
  "memory_get",
  "read",
  "write",
  "exec"
];

/**
 * Call OpenClaw Gateway API to execute a tool
 * @param {string} toolName - Tool name (e.g., "message", "memory_get", "read")
 * @param {object} toolInput - Tool arguments
 * @param {string} sessionId - OpenClaw session ID from X-OpenClaw-Session header
 * @returns {Promise<object>} - Tool result
 */
async function callOpenClawGatewayTool(toolName, toolInput, sessionId) {
  if (!OPENCLAW_TOOL_PROXY_ENABLED) {
    throw new Error(`Tool ${toolName} requires OpenClaw Gateway API (OPENCLAW_TOOL_PROXY_ENABLED=false)`);
  }

  if (!sessionId) {
    throw new Error(`Tool ${toolName} requires session context (X-OpenClaw-Session header missing)`);
  }

  if (!OPENCLAW_GATEWAY_TOKEN) {
    throw new Error(`Tool ${toolName} requires OPENCLAW_GATEWAY_TOKEN environment variable`);
  }

  return new Promise((resolve, reject) => {
    const requestBody = JSON.stringify({
      tool: toolName,
      input: toolInput,
      sessionId,
    });

    const url = new URL(OPENCLAW_GATEWAY_URL);
    const isHttps = url.protocol === "https:";
    const httpModule = isHttps ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: "/v1/tools/execute",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(requestBody),
        "Authorization": `Bearer ${OPENCLAW_GATEWAY_TOKEN}`,
        "X-OpenClaw-Session": sessionId,
      },
      timeout: 30000,
    };

    console.log(`[bridge] 🔗 Proxying ${toolName} to OpenClaw Gateway (session: ${sessionId.slice(0, 8)}...)`);

    const req = httpModule.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode === 200) {
            console.log(`[bridge] ✅ ${toolName} proxied successfully`);
            resolve(parsed.output || parsed.result || parsed);
          } else {
            const errorMsg = parsed.error?.message || parsed.error || data || `Gateway returned ${res.statusCode}`;
            console.log(`[bridge] ❌ ${toolName} proxy failed: ${errorMsg}`);
            reject(new Error(`OpenClaw Gateway returned ${res.statusCode}: ${errorMsg}`));
          }
        } catch (parseErr) {
          reject(new Error(`Failed to parse OpenClaw Gateway response: ${parseErr.message}`));
        }
      });
    });

    req.on("error", (err) => {
      console.log(`[bridge] ❌ ${toolName} proxy connection failed: ${err.message}`);
      reject(new Error(`OpenClaw Gateway connection error: ${err.message}`));
    });

    req.on("timeout", () => {
      req.destroy();
      reject(new Error(`OpenClaw Gateway proxy timeout after 30s`));
    });

    req.write(requestBody);
    req.end();
  });
}

function formatElapsed(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}min`;
}

function logMemory(label) {
  const mem = process.memoryUsage();
  const heapMB = Math.round(mem.heapUsed / 1024 / 1024);
  const rssMB = Math.round(mem.rss / 1024 / 1024);
  console.log(`[bridge] 💾 ${label}: heap=${heapMB}MB rss=${rssMB}MB`);
}

// Re-validation interval - probe paid availability at least every 5 hours.
const REVALIDATION_INTERVAL_MS = 5 * 60 * 60 * 1000;
let lastRevalidationTime = Date.now();

// Pre-computed at startup - validated key and mode
let STARTUP_INITIALIZED = false;
let STARTUP_WINNER = null; // Pre-selected winning key + mode for fast requests

// Get the Codebuff API key from environment
function getApiKey() {
  return process.env.CODEBUFF_API_KEY || null;
}

// Check if error is a rate limit (should NOT be considered "working")
function isRateLimitError(errStr) {
  const s = errStr.toLowerCase();
  return (
    s.includes("429") ||
    s.includes("rate_limit") ||
    s.includes("rate_limit_exceeded") ||
    s.includes("too many requests") ||
    s.includes("session limit") ||
    s.includes("weekly limit") ||
    s.includes("limit resets") ||
    s.includes("continue with credits")
  );
}

// Check if error is a payment required error (should NOT be considered "working")
// Returns: { isPaymentError: boolean, isFreeAccount: boolean, resetInfo: string }
function checkPaymentRequiredError(errStr) {
  const s = errStr.toLowerCase();
  const has402 =
    s.includes("402") ||
    s.includes("payment required") ||
    s.includes("out of credits") ||
    s.includes("add credits") ||
    s.includes("insufficient credits");
  const isFreeAccount = s.includes("free credits reset");
  const resetMatch = errStr.match(/resets in (\d+ \w+)/);
  const resetInfo = resetMatch ? ` (resets in ${resetMatch[1]})` : "";

  return {
    isPaymentError: has402,
    isFreeAccount,
    resetInfo,
  };
}

// Test API key in a specific mode (paid or free)
async function testApiKeyInMode(apiKey, index, costMode) {
  const client = new CodebuffClient({
    apiKey,
    cwd: DEFAULT_CWD,
  });

  const runOpts = {
    agent: MODEL_ID,
    prompt: "Say 'ok' if you can read this.",
    maxAgentSteps: 1,
  };

  if (costMode) {
    runOpts.costMode = costMode;
  }

  try {
    const result = await Promise.race([
      client.run(runOpts),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 30_000)),
    ]);

    const output = result?.output || "";
    const outputStr = typeof output === "string" ? output : JSON.stringify(output);

    // Check for auth errors in output
    if (
      outputStr.includes("401") ||
      outputStr.includes("Unauthorized") ||
      outputStr.includes("Authentication failed")
    ) {
      return { success: false, error: "auth" };
    }

    // Check for rate limit errors
    if (isRateLimitError(outputStr)) {
      return { success: false, error: "rate_limit" };
    }

    // Check for payment required errors
    const paymentCheck = checkPaymentRequiredError(outputStr);
    if (paymentCheck.isPaymentError) {
      return {
        success: false,
        error: "payment_required",
        isFreeAccount: paymentCheck.isFreeAccount,
      };
    }

    return { success: true };
  } catch (err) {
    const errStr = err.message || String(err);

    // Check for auth errors
    if (errStr.includes("401") || errStr.includes("Unauthorized") || errStr.includes("auth")) {
      return { success: false, error: "auth" };
    }

    // Check for rate limit errors
    if (isRateLimitError(errStr)) {
      return { success: false, error: "rate_limit" };
    }

    // Check for payment required errors
    const paymentCheck = checkPaymentRequiredError(errStr);
    if (paymentCheck.isPaymentError) {
      return {
        success: false,
        error: "payment_required",
        isFreeAccount: paymentCheck.isFreeAccount,
      };
    }

    // Timeout means the key is NOT working
    if (errStr.toLowerCase().includes("timeout")) {
      return { success: false, error: "timeout" };
    }

    // Other errors - assume working
    return { success: true };
  }
}

// Test API key - two-phase: try paid mode first, then free mode if needed
// Returns: { works: boolean, mode: "paid" | "free" | null }
async function testApiKey(apiKey, index) {
  const masked = apiKey.slice(0, 6) + "..." + apiKey.slice(-4);

  // Phase 1: Test in paid mode (no costMode)
  console.log(`[bridge] Key ${index + 1} (${masked}): Testing paid mode...`);
  const paidResult = await testApiKeyInMode(apiKey, index, undefined);

  if (paidResult.success) {
    console.log(`[bridge] Key ${index + 1} (${masked}): ✅ working (paid mode)`);
    return { works: true, mode: "paid" };
  }

  if (paidResult.error === "auth") {
    console.warn(`[bridge] Key ${index + 1} (${masked}): ❌ auth failed`);
    return { works: false, mode: null };
  }

  if (paidResult.error === "rate_limit") {
    console.warn(`[bridge] Key ${index + 1} (${masked}): ❌ rate limited`);
    return { works: false, mode: null };
  }

  if (paidResult.error === "payment_required" && !paidResult.isFreeAccount) {
    // Paid account out of credits - try free mode
    console.log(`[bridge] Key ${index + 1} (${masked}): Paid mode failed, testing free mode...`);
    const freeResult = await testApiKeyInMode(apiKey, index, "free");

    if (freeResult.success) {
      console.log(`[bridge] Key ${index + 1} (${masked}): ✅ working (free mode)`);
      return { works: true, mode: "free" };
    }

    // Free mode also failed - return error with clear message for symphony-bridge fallback
    console.warn(
      `[bridge] Key ${index + 1} (${masked}): ❌ out of credits (both paid and free modes exhausted)`,
    );
    return { works: false, mode: null, error: "both_modes_exhausted" };
  }

  if (paidResult.error === "payment_required" && paidResult.isFreeAccount) {
    // This IS a free account - no paid credits, test free mode
    console.log(`[bridge] Key ${index + 1} (${masked}): Free account, testing free mode...`);
    const freeResult = await testApiKeyInMode(apiKey, index, "free");

    if (freeResult.success) {
      console.log(`[bridge] Key ${index + 1} (${masked}): ✅ working (free mode)`);
      return { works: true, mode: "free" };
    }

    console.warn(`[bridge] Key ${index + 1} (${masked}): ❌ free mode also failed`);
    return { works: false, mode: null };
  }

  // Other error - try free mode as fallback
  console.log(`[bridge] Key ${index + 1} (${masked}): Paid mode error, testing free mode...`);
  const fallbackResult = await testApiKeyInMode(apiKey, index, "free");

  if (fallbackResult.success) {
    console.log(`[bridge] Key ${index + 1} (${masked}): ✅ working (free mode)`);
    return { works: true, mode: "free" };
  }

  console.warn(
    `[bridge] Key ${index + 1} (${masked}): ❌ both modes failed (all attempts exhausted)`,
  );
  return { works: false, mode: null, error: "both_modes_exhausted" };
}

// Test the API key at startup and determine the best mode (paid or free)
async function testKeyAndSelectWinner(apiKey) {
  const masked = apiKey.slice(0, 6) + "..." + apiKey.slice(-4);
  console.log(`[bridge] Testing API key (${masked})...`);

  const result = await testApiKey(apiKey, 0);

  if (result.works) {
    const isPaid = result.mode === "paid";
    console.log(`[bridge] 🎯 Key working in ${result.mode} mode`);
    STARTUP_WINNER = {
      apiKey,
      costMode: isPaid ? undefined : "free",
      label: isPaid ? "paid (pre-warmed)" : "free (pre-warmed)",
      isPaid,
    };
    return;
  }

  // Key failed - throw clear error for symphony-bridge to catch and try other providers
  if (result.error === "both_modes_exhausted") {
    throw new Error("Codebuff provider exhausted: both paid and free modes are out of credits");
  }

  // Other failures - set as fallback anyway (will fail at runtime with clear error)
  console.warn(`[bridge] ⚠️ Key failed at startup — using paid mode as fallback`);
  STARTUP_WINNER = {
    apiKey,
    costMode: undefined,
    label: "paid (expected to fail)",
    isPaid: true,
  };
}

// Build prompt from OpenAI-style messages
function buildPrompt(messages) {
  return messages
    .map((m) => {
      const role = m.role?.toUpperCase() || "USER";
      const content = typeof m.content === "string" ? m.content : JSON.stringify(m.content);
      return `${role}:\n${content}`;
    })
    .join("\n\n");
}

// Check SDK result for structured error responses (rate limit, payment, type:"error")
// Throws if the result contains a recognizable error — callers catch and handle fallback.
function checkResultForErrors(output, resultStr, attempt) {
  let parsed;
  try {
    parsed = typeof output === "string" ? JSON.parse(resultStr) : output;
  } catch {
    return; // Not JSON — no structured error to check
  }
  if (!parsed || typeof parsed !== "object") return;

  const isErrorType = parsed.type === "error";
  const fields = [parsed.error, parsed.message, parsed.errorMessage].filter(
    (f) => f && typeof f === "string",
  );

  for (const field of fields) {
    if (isRateLimitError(field)) {
      throw new Error(`Rate limited on ${attempt.label}`);
    }
    const pc = checkPaymentRequiredError(field);
    if (pc.isPaymentError) {
      if (attempt.costMode === "free") {
        throw new Error(
          `Codebuff provider exhausted: both paid and free modes are out of credits${pc.resetInfo}`,
        );
      }
      throw new Error(`Payment required on ${attempt.label}${pc.resetInfo}`);
    }
  }

  // If the SDK returned a type:"error" that didn't match specific patterns, still throw
  if (isErrorType) {
    const msg = parsed.message || parsed.error || "Unknown error";
    throw new Error(`Codebuff SDK error on ${attempt.label}: ${msg}`);
  }
}

// Check whether an error message indicates a recoverable paid-mode failure
// that should trigger a paid→free fallback.
function isRecoverableError(errMsg) {
  const s = errMsg.toLowerCase();
  return (
    s.includes("rate limit") ||
    s.includes("payment required") ||
    s.includes("too many requests") ||
    s.includes("session limit") ||
    s.includes("out of credits") ||
    s.includes("quota exhausted") ||
    s.includes("codebuff sdk error")
  );
}

// Suppress verbose SDK error dumps and warnings
function suppressSDKErrors(fn) {
  const originalError = console.error;
  const originalWarn = console.warn;
  return async (...args) => {
    console.error = (...errArgs) => {
      const errStr = String(errArgs[0] || "");
      // Only suppress Vercel AI SDK error dumps
      if (errStr.includes("Symbol(vercel.ai.error)")) {
        return;
      }
      originalError(...errArgs);
    };
    console.warn = (...warnArgs) => {
      const warnStr = String(warnArgs[0] || "");
      // Suppress tools.profile allowlist warnings - these are SDK internal notices
      // about tools that are unavailable in current runtime/model config
      if (
        warnStr.includes("tools.profile") &&
        warnStr.includes("allowlist contains unknown entries")
      ) {
        return;
      }
      originalWarn(...warnArgs);
    };
    try {
      return await fn(...args);
    } finally {
      console.error = originalError;
      console.warn = originalWarn;
    }
  };
}

// Format tool call display for rich event logging (matches old symphony-bridge invokeWithCodebuff)
function formatToolCallDisplay(toolName, input) {
  if (toolName === "read_files" && input.paths) {
    const paths = input.paths.map((p) => p.split("/").pop()).join(", ");
    return `📖 Reading: ${paths}`;
  } else if (toolName === "str_replace") {
    return `✏️ Editing: ${input.path || "file"}`;
  } else if (toolName === "write_file") {
    return `📝 Writing: ${input.path || "file"}`;
  } else if (toolName === "run_terminal_command") {
    const cmd = (input.command || "").slice(0, 120);
    return `💻 Running: ${cmd}`;
  } else if (toolName === "code_search") {
    return `🔍 Searching: ${input.pattern || input.query || ""}`;
  } else if (toolName === "spawn_agent_inline") {
    const agentType = input.agent_type || "agent";
    if (agentType === "context-pruner") return null;
    return `🤖 Spawning: ${agentType}`;
  } else if (toolName === "spawn_agents") {
    const agents = input.agents || [];
    const types = agents.map((a) => a.agent_type).filter(Boolean);
    return `🤖 Spawning: ${types.length > 0 ? types.join(", ") : "agents"}`;
  } else if (toolName === "add_subgoal") {
    const obj = (input.objective || "").slice(0, 120);
    return `🎯 Goal: ${obj}`;
  } else if (toolName === "update_subgoal") {
    const log = (input.log || input.status || "").slice(0, 120);
    return `📋 Progress: ${log}`;
  } else if (toolName === "think_deeply") {
    return `🧠 Thinking deeply...`;
  } else if (toolName === "create_plan") {
    return `📋 Creating plan...`;
  } else if (toolName === "browser_logs") {
    return `🌐 Checking browser...`;
  }
  const args = JSON.stringify(input).slice(0, 150);
  return `🔧 ${toolName}: ${args}`;
}

// Helper to create SSE chunk objects for streaming responses
function makeSseChunk(completionId, created, content) {
  return {
    id: completionId,
    object: "chat.completion.chunk",
    created,
    model: MODEL_ID,
    choices: [{ index: 0, delta: { content }, finish_reason: null }],
  };
}

// Check if an event is from the context-pruner (should be filtered/hidden)
function isContextPrunerEvent(event) {
  const name = event.displayName || event.agentType || "";
  return name.toLowerCase() === "context pruner" || name.includes("context-pruner");
}

// Extract actual text content from Codebuff/Vercel AI SDK response
// Also returns whether the response contains active subgoals (for continuation detection)
function extractTextFromResponse(resultStr) {
  let hasActiveSubgoals = false;

  try {
    const parsed = JSON.parse(resultStr);

    // Handle lastMessage format: { type: "lastMessage", value: [...] }
    if (parsed?.type === "lastMessage" && parsed?.value) {
      const messages = Array.isArray(parsed.value) ? parsed.value : [parsed.value];
      for (const msg of messages) {
        // Check for active subgoals in the message
        if (msg.content && Array.isArray(msg.content)) {
          for (const item of msg.content) {
            const toolName = item.toolName || item.name;
            if (toolName === "update_subgoal" || toolName === "add_subgoal") {
              const status = (item.input?.status || item.args?.status || "").toUpperCase();
              if (status === "IN_PROGRESS" || status === "NOT_STARTED") {
                hasActiveSubgoals = true;
              }
            }
          }
        }

        const text = extractTextFromMessage(msg);
        if (text) return { text, hasActiveSubgoals };
      }
    }

    // Handle direct message format: { role: "assistant", content: "..." }
    const text = extractTextFromMessage(parsed);
    if (text) return { text, hasActiveSubgoals: false };

    // If we can't parse it, return the raw string
    return { text: resultStr, hasActiveSubgoals: false };
  } catch {
    // Not JSON, return as-is
    return { text: resultStr, hasActiveSubgoals: false };
  }
}

// Extract text from a single message object using AI SDK utilities for robustness
// Optionally filter out tool-call parts for cleaner output to clients
function extractTextFromMessage(msg, filterToolCalls = true) {
  if (!msg || msg.role !== "assistant") return null;

  const content = msg.content;

  // If content is a string, return it directly
  if (typeof content === "string") {
    console.log(`[bridge] 📝 Content: string (${content.length} chars)`);
    return content;
  }

  // If content is an array, use AI SDK utilities to extract text from content parts
  if (Array.isArray(content)) {
    const textParts = [];
    const partTypes = [];

    for (const part of content) {
      if (!part) continue;

      const partType = part.type || "unknown";

      // Skip tool-call parts if filtering is enabled (for cleaner client output)
      if (filterToolCalls && (isToolUIPart(part) || part.type === "tool-call")) {
        console.log(`[bridge] 📝 Part: tool-call (filtered out)`);
        continue;
      }

      partTypes.push(partType);

      // Use AI SDK utilities for robust type checking
      if (isTextUIPart(part)) {
        // Standard text content
        const text = part.text || part.content || "";
        if (text) {
          textParts.push(text);
          console.log(`[bridge] 📝 Part: text (${text.length} chars)`);
        }
      } else if (isReasoningUIPart(part)) {
        // Model reasoning/rationale
        const reasoning = part.reasoning || part.content || "";
        if (reasoning) {
          textParts.push(reasoning);
          console.log(`[bridge] 📝 Part: reasoning (${reasoning.length} chars)`);
        }
      } else if (isDataUIPart(part)) {
        // Data parts - skip
        console.log(`[bridge] 📝 Part: data (skipped)`);
      } else {
        // Unknown type - try common fields
        const text = part.text || part.content || part.result || "";
        if (text) {
          const textStr = typeof text === "string" ? text : JSON.stringify(text);
          textParts.push(textStr);
          console.log(`[bridge] 📝 Part: ${partType} (${textStr.length} chars)`);
        } else {
          console.log(`[bridge] 📝 Part: ${partType} (no extractable text)`);
        }
      }
    }

    console.log(`[bridge] 📝 Content types found: ${partTypes.join(", ")}`);

    if (textParts.length > 0) {
      const result = textParts.join("\n");
      console.log(`[bridge] 📝 Extracted ${result.length} chars total`);
      return result;
    }
  }

  return null;
}

// Try a single account — includes rich event handling, subgoal tracking, and
// auto-continuation loop with previousRun (memento mode), matching the old
// symphony-bridge invokeWithCodebuff that was lost during extraction.
async function trySingleAccount(attempt, prompt, makeTimeout, cwd, _sessionId = null, _proxyToolFn = null) {
  let lastSubgoalStatus = null;
  const toolsUsed = new Set();

  const client = new CodebuffClient({
    apiKey: attempt.apiKey,
    cwd: cwd || DEFAULT_CWD,
  });

  // No-op streamActivity for non-streaming mode (just logs, doesn't send to client)
  const streamActivity = (_text) => {
    // In non-streaming mode, we don't send to client, just log
    // The streaming version will override this with actual SSE sending
  };

  const handleEvent = (event) => {
    try {
      if (!event) return;
      // Text events are delivered via handleStreamChunk; skip to avoid duplication
      if (event.type === "text") return;

      const type = event.type;

      if (type === "tool_call" || type === "tool-call") {
        const toolName = event.toolName || event.name || "unknown";
        toolsUsed.add(toolName);

        if (CODEBUFF_NOISY_TOOLS.has(toolName)) {
          console.log(`[bridge] codebuff ${toolName} (internal)`);
          return;
        }

        const input = event.input || {};
        if (toolName === "update_subgoal") {
          lastSubgoalStatus = input.status || lastSubgoalStatus;
        }
        if (toolName === "add_subgoal") {
          lastSubgoalStatus = input.status || "IN_PROGRESS";
        }

        const display = formatToolCallDisplay(toolName, input);
        if (display) console.log(`[bridge] ${display}`);
      } else if (type === "tool_result" || type === "tool-result") {
        const toolName = event.toolName || "tool";
        if (!CODEBUFF_NOISY_TOOLS.has(toolName)) {
          console.log(`[bridge] ✅ codebuff ${toolName} done`);
          streamActivity(`✅ ${toolName} done\n`);
        }
      } else if (type === "reasoning_delta" || type === "reasoning") {
        const text = event.text || event.content || "";
        if (text) console.log(`[bridge] 💡 ${text.slice(0, 80)}...`);
      } else if (type === "subagent_start" || type === "subagent-start") {
        if (isContextPrunerEvent(event)) {
          console.log(`[bridge] codebuff context-pruner (internal)`);
          return;
        }
        const name = event.displayName || event.agentType || "subagent";
        console.log(`[bridge] 🤖 codebuff subagent: ${name}`);
      } else if (type === "subagent_finish" || type === "subagent-finish") {
        if (isContextPrunerEvent(event)) return;
        const name = event.displayName || event.agentType || "subagent";
        console.log(`[bridge] 🤖 codebuff ${name} done`);
        streamActivity(`🤖 ${name} done\n`);
      } else if (type === "agent_start" || type === "agent_finish") {
        console.log(`[bridge] 🤖 codebuff ${type}`);
      } else if (type === "error") {
        console.log(`[bridge] ❌ codebuff error: ${event.message || JSON.stringify(event)}`);
      }
    } catch (err) {
      console.log(`[bridge] handleEvent error: ${err.message}`);
    }
  };

  const callbacks = {
    handleEvent,
    handleStreamChunk: () => {},
  };

  const runOpts = {
    agent: MODEL_ID,
    prompt,
    maxAgentSteps: CODEBUFF_MAX_STEPS,
    ...callbacks,
  };
  if (attempt.costMode) runOpts.costMode = attempt.costMode;

  let result = await suppressSDKErrors(() => Promise.race([client.run(runOpts), makeTimeout()]))();

  // Error checks on initial run
  const output = result.output;
  const resultStr = typeof output === "string" ? output : JSON.stringify(output);

  if (resultStr.includes("Symbol(vercel.ai.error)")) {
    const errorMatch = resultStr.match(/"message":"([^"]+)"/);
    throw new Error(errorMatch ? errorMatch[1] : "SDK error (output parsing failed)");
  }
  checkResultForErrors(output, resultStr, attempt);

  // Continuation loop — if the agent set a subgoal but didn't complete it,
  // auto-continue with previousRun to let it finish the task (memento mode)
  let continuation = 0;
  while (continuation < CODEBUFF_MAX_CONTINUATIONS && lastSubgoalStatus === "IN_PROGRESS") {
    continuation++;
    console.log(
      `[bridge] 🔄 Auto-continue ${continuation}/${CODEBUFF_MAX_CONTINUATIONS} (subgoal still IN_PROGRESS)`,
    );
    maybeGC();

    const contOpts = {
      agent: MODEL_ID,
      prompt: "Continue with the next step of the task. Complete the remaining work.",
      previousRun: result,
      maxAgentSteps: CODEBUFF_MAX_STEPS,
      ...callbacks,
    };
    if (attempt.costMode) contOpts.costMode = attempt.costMode;

    result = await suppressSDKErrors(() => Promise.race([client.run(contOpts), makeTimeout()]))();

    const contOutput = result.output;
    const contStr = typeof contOutput === "string" ? contOutput : JSON.stringify(contOutput);
    if (contStr.includes("Symbol(vercel.ai.error)")) {
      const errorMatch = contStr.match(/"message":"([^"]+)"/);
      throw new Error(errorMatch ? errorMatch[1] : "SDK error (output parsing failed)");
    }
    checkResultForErrors(contOutput, contStr, attempt);
  }

  if (continuation > 0) {
    console.log(
      `[bridge] Completed after ${continuation + 1} runs (subgoal: ${lastSubgoalStatus})`,
    );
  }

  console.log(`[bridge] ✅ Success on ${attempt.label}`);

  if (toolsUsed.size > 0) {
    console.log(`[bridge] 📊 Tools used: ${Array.from(toolsUsed).join(", ")}`);
  } else {
    console.log(`[bridge] 📊 Tools used: none (text-only mode)`);
  }

  const finalOutput = result.output;
  const finalStr = typeof finalOutput === "string" ? finalOutput : JSON.stringify(finalOutput);
  const needsContinuation = lastSubgoalStatus === "IN_PROGRESS";

  // Extract clean text from final result, filtering out tool metadata
  const { text: cleanText } = extractTextFromResponse(finalStr);

  return {
    text: cleanText,
    account: attempt.label,
    isPaid: attempt.isPaid,
    needsContinuation,
    hasSubgoals: lastSubgoalStatus !== null,
  };
}

// Get pre-selected winner (computed at startup)
function getWinner() {
  if (!STARTUP_INITIALIZED) {
    throw new Error("Bridge not initialized - startup validation not complete");
  }
  if (!STARTUP_WINNER) {
    throw new Error("No API key configured - set CODEBUFF_API_KEY");
  }
  return STARTUP_WINNER;
}

// Re-validate and potentially switch mode (paid→free or free→paid)
async function revalidateAndSelectWinner() {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn(`[bridge] No API key available for re-validation`);
    return;
  }

  console.log(`[bridge] 🔄 Re-validating API key...`);
  lastRevalidationTime = Date.now();

  await testKeyAndSelectWinner(apiKey);

  if (STARTUP_WINNER) {
    console.log(`[bridge] 🔄 Re-validation complete: ${STARTUP_WINNER.label}`);
  }
}

// Use pre-warmed winner directly, with paid→free fallback on recoverable errors
async function invokeCodebuff({ messages, cwd, sessionId = null, proxyToolFn = null }) {
  if (Date.now() - lastRevalidationTime > REVALIDATION_INTERVAL_MS) {
    console.log(`[bridge] ⏰ Time-based re-validation triggered`);
    await revalidateAndSelectWinner();
  }

  const winner = getWinner();
  console.log(`[bridge] Using: ${winner.label}`);

  const prompt = buildPrompt(messages);
  const makeTimeout = () =>
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Timeout after ${TIMEOUT_MS}ms`)), TIMEOUT_MS);
    });

  try {
    return await trySingleAccount(winner, prompt, makeTimeout, cwd, sessionId, proxyToolFn);
  } catch (err) {
    if (winner.isPaid && isRecoverableError(err.message)) {
      console.log(`[bridge] ⚠️ Paid mode failed: ${err.message}`);
      console.log(`[bridge] 🔄 Falling back to free mode...`);

      const freeAttempt = {
        apiKey: winner.apiKey,
        costMode: "free",
        label: "free (fallback)",
        isPaid: false,
      };

      // Update STARTUP_WINNER so subsequent requests use free mode until re-probe.
      // Reset revalidation timer so paid mode is re-probed in 5 hours.
      STARTUP_WINNER = freeAttempt;
      lastRevalidationTime = Date.now();
      console.log(`[bridge] 🕐 Will re-probe paid mode in ${REVALIDATION_INTERVAL_MS / 3600000}h`);

      return await trySingleAccount(freeAttempt, prompt, makeTimeout, cwd, sessionId, proxyToolFn);
    }
    throw err;
  }
}

// Try a single account for streaming — includes rich event handling, token-by-token
// streaming via handleStreamChunk, subgoal tracking, and auto-continuation loop
// with previousRun (memento mode), matching the old symphony-bridge invokeWithCodebuff.
async function trySingleAccountStream(
  attempt,
  prompt,
  makeTimeout,
  cwd,
  onChunk,
  completionId,
  created,
  _sessionId = null,
  _proxyToolFn = null,
) {
  let fullText = "";
  let lastSubgoalStatus = null;
  const toolsUsed = new Set();

  const client = new CodebuffClient({
    apiKey: attempt.apiKey,
    cwd: cwd || DEFAULT_CWD,
  });

  // Stream a text fragment to the client as an SSE chunk
  const streamActivity = (text) => {
    if (onChunk && text) {
      const chunk = makeSseChunk(completionId, created, text);
      console.log(`[bridge] 🌊 Streaming activity: ${text.slice(0, 80)}`);
      console.log(`[bridge] 📤 SSE chunk: ${JSON.stringify(chunk).slice(0, 200)}`);
      onChunk(chunk);
    }
  };

  const handleEvent = (event) => {
    try {
      if (!event) return;
      // Text events are delivered via handleStreamChunk; skip to avoid duplication
      if (event.type === "text") return;

      const type = event.type;

      if (type === "tool_call" || type === "tool-call") {
        const toolName = event.toolName || event.name || "unknown";
        toolsUsed.add(toolName);

        if (CODEBUFF_NOISY_TOOLS.has(toolName)) {
          console.log(`[bridge] codebuff ${toolName} (internal)`);
          return;
        }

        const input = event.input || {};
        if (toolName === "update_subgoal") {
          lastSubgoalStatus = input.status || lastSubgoalStatus;
        }
        if (toolName === "add_subgoal") {
          lastSubgoalStatus = input.status || "IN_PROGRESS";
        }

        const display = formatToolCallDisplay(toolName, input);
        if (display) {
          console.log(`[bridge] ${display}`);
          streamActivity("\n" + display + "\n");
        }
      } else if (type === "tool_result" || type === "tool-result") {
        const toolName = event.toolName || "tool";
        // Log completion server-side but do NOT stream to client
        console.log(`[bridge] ✅ codebuff ${toolName} done`);
      } else if (type === "reasoning_delta" || type === "reasoning") {
        const text = event.text || event.content || "";
        if (text) {
          console.log(`[bridge] 💡 ${text.slice(0, 80)}...`);
          streamActivity(`💡 ${text}\n`);
        }
      } else if (type === "subagent_start" || type === "subagent-start") {
        if (isContextPrunerEvent(event)) {
          console.log(`[bridge] codebuff context-pruner (internal)`);
          return;
        }
        const name = event.displayName || event.agentType || "subagent";
        console.log(`[bridge] 🤖 codebuff subagent: ${name}`);
        streamActivity(`🤖 ${name}\n`);
      } else if (type === "subagent_finish" || type === "subagent-finish") {
        if (isContextPrunerEvent(event)) return;
        const name = event.displayName || event.agentType || "subagent";
        console.log(`[bridge] 🤖 codebuff ${name} done`);
        streamActivity(`🤖 ${name} done\n`);
      } else if (type === "agent_start" || type === "agent_finish") {
        console.log(`[bridge] 🤖 codebuff ${type}`);
      } else if (type === "error") {
        console.log(`[bridge] ❌ codebuff error: ${event.message || JSON.stringify(event)}`);
        streamActivity(`❌ Error: ${event.message || "unknown error"}\n`);
      }
    } catch (err) {
      console.log(`[bridge] handleEvent error: ${err.message}`);
    }
  };

  // Token-by-token text streaming — the primary text delivery path.
  // The old symphony-bridge invokeWithCodebuff used this callback and it was
  // lost when the codebuff-bridge was extracted.
  const handleStreamChunk = (chunk) => {
    try {
      let text = null;
      if (typeof chunk === "string") text = chunk;
      else if (chunk && chunk.chunk) text = chunk.chunk;
      if (text) {
        fullText += text;
        onChunk(makeSseChunk(completionId, created, text));
      }
    } catch (err) {
      console.log(`[bridge] handleStreamChunk error: ${err.message}`);
    }
  };

  const callbacks = { handleEvent, handleStreamChunk };

  const runOpts = {
    agent: MODEL_ID,
    prompt,
    maxAgentSteps: CODEBUFF_MAX_STEPS,
    ...callbacks,
  };
  if (attempt.costMode) runOpts.costMode = attempt.costMode;

  let result = await suppressSDKErrors(() => Promise.race([client.run(runOpts), makeTimeout()]))();

  // Error checks on initial run
  const output = result.output || "";
  const resultStr = typeof output === "string" ? output : JSON.stringify(output);

  if (resultStr.includes("Symbol(vercel.ai.error)")) {
    const errorMatch = resultStr.match(/"message":"([^"]+)"/);
    throw new Error(errorMatch ? errorMatch[1] : "SDK error (output parsing failed)");
  }
  checkResultForErrors(output, resultStr, attempt);

  // Continuation loop — if the agent set a subgoal but didn't complete it,
  // auto-continue with previousRun to let it finish the task (memento mode)
  let continuation = 0;
  while (continuation < CODEBUFF_MAX_CONTINUATIONS && lastSubgoalStatus === "IN_PROGRESS") {
    continuation++;
    console.log(
      `[bridge] 🔄 Auto-continue ${continuation}/${CODEBUFF_MAX_CONTINUATIONS} (subgoal still IN_PROGRESS)`,
    );
    streamActivity(`\n🔄 Continuing (${continuation}/${CODEBUFF_MAX_CONTINUATIONS})...\n`);
    maybeGC();

    const contOpts = {
      agent: MODEL_ID,
      prompt: "Continue with the next step of the task. Complete the remaining work.",
      previousRun: result,
      maxAgentSteps: CODEBUFF_MAX_STEPS,
      ...callbacks,
    };
    if (attempt.costMode) contOpts.costMode = attempt.costMode;

    result = await suppressSDKErrors(() => Promise.race([client.run(contOpts), makeTimeout()]))();

    const contOutput = result.output || "";
    const contStr = typeof contOutput === "string" ? contOutput : JSON.stringify(contOutput);
    if (contStr.includes("Symbol(vercel.ai.error)")) {
      const errorMatch = contStr.match(/"message":"([^"]+)"/);
      throw new Error(errorMatch ? errorMatch[1] : "SDK error (output parsing failed)");
    }
    checkResultForErrors(contOutput, contStr, attempt);
  }

  if (continuation > 0) {
    console.log(
      `[bridge] Completed after ${continuation + 1} runs (subgoal: ${lastSubgoalStatus})`,
    );
  }

  console.log(`[bridge] ✅ Success on ${attempt.label}`);

  if (toolsUsed.size > 0) {
    console.log(`[bridge] 📊 Tools used: ${Array.from(toolsUsed).join(", ")}`);
  } else {
    console.log(`[bridge] 📊 Tools used: none (text-only mode)`);
  }

  const needsContinuation = lastSubgoalStatus === "IN_PROGRESS";

  // Extract clean text from final result, filtering out tool metadata
  const finalOutput = result.output || "";
  const finalStr = typeof finalOutput === "string" ? finalOutput : JSON.stringify(finalOutput);
  const { text: cleanText } = extractTextFromResponse(fullText || finalStr);

  return {
    text: cleanText,
    account: attempt.label,
    isPaid: attempt.isPaid,
    needsContinuation,
    hasSubgoals: lastSubgoalStatus !== null,
    hadStreamingChunks: fullText.length > 0,
  };
}

// Use pre-warmed winner directly for streaming, with paid→free fallback on recoverable errors
async function invokeCodebuffStream({ messages, cwd, onChunk, completionId, created, sessionId = null, proxyToolFn = null }) {
  if (Date.now() - lastRevalidationTime > REVALIDATION_INTERVAL_MS) {
    console.log(`[bridge] ⏰ Time-based re-validation triggered (streaming)`);
    await revalidateAndSelectWinner();
  }

  const winner = getWinner();
  console.log(`[bridge] Streaming: Using ${winner.label}`);

  const prompt = buildPrompt(messages);
  const makeTimeout = () =>
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Timeout after ${TIMEOUT_MS}ms`)), TIMEOUT_MS);
    });

  // Track how many chunks were sent so we know if it's safe to retry.
  // The error case (rate limit, session limit) produces zero streaming output
  // events — the error JSON lands only in result.output, not via onChunk.
  let chunksSent = 0;
  const trackedOnChunk = (chunk) => {
    chunksSent++;
    onChunk(chunk);
  };

  try {
    return await trySingleAccountStream(
      winner,
      prompt,
      makeTimeout,
      cwd,
      trackedOnChunk,
      completionId,
      created,
      sessionId,
      proxyToolFn,
    );
  } catch (err) {
    if (winner.isPaid && isRecoverableError(err.message) && chunksSent === 0) {
      console.log(`[bridge] ⚠️ Paid mode failed (streaming, 0 chunks sent): ${err.message}`);
      console.log(`[bridge] 🔄 Falling back to free mode...`);

      const freeAttempt = {
        apiKey: winner.apiKey,
        costMode: "free",
        label: "free (fallback)",
        isPaid: false,
      };

      // Update STARTUP_WINNER so subsequent requests use free mode until re-probe.
      // Reset revalidation timer so paid mode is re-probed in 5 hours.
      STARTUP_WINNER = freeAttempt;
      lastRevalidationTime = Date.now();
      console.log(`[bridge] 🕐 Will re-probe paid mode in ${REVALIDATION_INTERVAL_MS / 3600000}h`);

      return await trySingleAccountStream(
        freeAttempt,
        prompt,
        makeTimeout,
        cwd,
        onChunk,
        completionId,
        created,
        sessionId,
        proxyToolFn,
      );
    }
    throw err;
  }
}

// HTTP utilities
function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

function unauthorized(res) {
  sendJson(res, 401, {
    error: { message: "Unauthorized", type: "invalid_request_error" },
  });
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
  // Extract OpenClaw session ID from request headers (passed by Symphony bridge)
    const _openclawSessionId = req.headers["x-openclaw-session"] || null;
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 5 * 1024 * 1024) {
        reject(new Error("Body too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

function checkAuth(req) {
  const auth = req.headers.authorization || "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  // Accept exact token or any token starting with "local-" (for local integrations like symphony-bridge)
  return token === API_KEY || token.startsWith("local-") || token === "";
}

// Main request handler
const server = http.createServer(async (req, res) => {
  // Debug: log ALL requests before any processing
  console.log(`[bridge] ===== REQUEST =====`);
  console.log(`[bridge] method: ${req.method}, url: ${req.url}`);
  console.log(`[bridge] headers: authorization=${req.headers.authorization?.slice(0, 20)}...`);
  if (req.headers["x-openclaw-session"]) {
    console.log(`[bridge] session: ${req.headers["x-openclaw-session"].slice(0, 12)}...`);
  }
  console.log(`[bridge] ===================`);

  // Extract OpenClaw session ID for tool proxying
  const openclawSessionId = req.headers["x-openclaw-session"] || null;

  try {
    // Auth check (skip for health check and model list)
    const skipAuth = req.url === "/health" || req.url === "/v1/models";
    if (!skipAuth && !checkAuth(req)) {
      console.log(`[bridge] Auth failed for ${req.method} ${req.url}`);
      return unauthorized(res);
    }

    // GET /v1/models
    if (req.method === "GET" && req.url === "/v1/models") {
      return sendJson(res, 200, {
        object: "list",
        data: [
          {
            id: MODEL_ID,
            object: "model",
            owned_by: "codebuff-bridge",
            created: 1704067200,
          },
        ],
      });
    }

    // GET /health (no auth required)
    if (req.method === "GET" && req.url === "/health") {
      return sendJson(res, 200, getHealthStatus());
    }



    // POST /v1/chat/completions or /chat/completions (OpenClaw might use either)
    if (
      req.method === "POST" &&
      (req.url === "/v1/chat/completions" || req.url === "/chat/completions")
    ) {
      const body = await parseBody(req);
      
      // Store session ID for tool proxy access
      req.openclawSessionId = openclawSessionId;
      const model = body.model || MODEL_ID;
      const messages = Array.isArray(body.messages) ? body.messages : [];
      const stream = body.stream === true;

      // Extract issue context from user messages
      const userMessages = messages.filter((m) => m.role === "user");
      let issueContext = null;
      for (const msg of userMessages) {
        const content = typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content);
        // Look for issue identifier pattern (e.g., "ANQ-123")
        const issueMatch = content.match(/##\s*Issue:\s*([A-Z]+-\d+)\s*[—-]\s*([^\n]+)/);
        if (issueMatch) {
          issueContext = { identifier: issueMatch[1], title: issueMatch[2].trim() };
          break;
        }
      }

      // Determine if this is a new request or continuation
      const isNewRequest = messages.length <= 2;

      // Log start for new requests (only on first message)
      if (issueContext && isNewRequest) {
        console.log(`[bridge] 🚀 Starting: ${issueContext.identifier} — ${issueContext.title}`);
      }

      console.log(
        `[bridge] Chat completion request: model=${model}, messages=${messages.length}, stream=${stream}`,
      );
      logMemory("request-start");
      const requestStartTime = Date.now();

      if (stream) {
        // Streaming mode - set headers before any writes
        res.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          "X-Accel-Buffering": "no",
          "X-Codebuff-Mode": STARTUP_WINNER?.isPaid ? "paid" : "free",
        });

        const completionId = `chatcmpl-${Date.now()}`;
        const created = Math.floor(Date.now() / 1000);
        // Heartbeat to keep connection alive
        const heartbeat = setInterval(() => {
          try {
            res.write(": heartbeat\n\n");
          } catch {
            // Ignore write errors on closed connections
          }
        }, 10000);

        let streamResult = null;

        try {
          console.log(`[bridge] ⏱️ Starting streaming invocation...`);
          streamResult = await invokeCodebuffStream({
            messages,
            cwd: DEFAULT_CWD,
            completionId,
            created,
            sessionId: openclawSessionId,
            proxyToolFn: openclawSessionId ? callOpenClawGatewayTool : null,
            onChunk: (chunk) => {
              // Send immediately to client
              res.write(`data: ${JSON.stringify(chunk)}\n\n`);
            },
          });

          console.log(
            `[bridge] ⏱️ Streaming invocation complete (elapsed: ${formatElapsed(Date.now() - requestStartTime)})`,
          );
          logMemory("stream-done");

          // Determine finish_reason and send any remaining content
          let finishReason = "stop";

          // Send any remaining text after filtering tool metadata
          if (streamResult?.text && streamResult.text.length > 0) {
            // Extract text content, filtering out tool-call metadata
            const { text: filteredText } = extractTextFromResponse(streamResult.text);
            if (filteredText && filteredText.trim() && !streamResult.hadStreamingChunks) {
              const contentChunk = {
                id: completionId,
                object: "chat.completion.chunk",
                created,
                model,
                choices: [
                  {
                    index: 0,
                    delta: { content: filteredText },
                    finish_reason: null,
                  },
                ],
              };
              res.write(`data: ${JSON.stringify(contentChunk)}\n\n`);
            }
          }

          if (streamResult?.needsContinuation) {
            finishReason = "length"; // Signal more work needed
            if (streamResult.hasSubgoals) {
              console.log(
                `[bridge] 🔄 More work needed: ${issueContext?.identifier || "request"} (active subgoals)`,
              );
            } else {
              console.log(
                `[bridge] 🔄 More work needed: ${issueContext?.identifier || "request"} (pending work)`,
              );
            }
          } else if (issueContext) {
            console.log(`[bridge] ✅ Finished: ${issueContext.identifier}`);
          }

          // Send final chunk with appropriate finish_reason
          const finalChunk = {
            id: completionId,
            object: "chat.completion.chunk",
            created,
            model,
            choices: [
              {
                index: 0,
                delta: {},
                finish_reason: finishReason,
              },
            ],
          };
          res.write(`data: ${JSON.stringify(finalChunk)}\n\n`);

          // Send [DONE] marker
          res.write("data: [DONE]\n\n");
          res.end();
        } catch (streamError) {
          // Send error as SSE event before closing
          console.error(
            `[bridge] Streaming error after ${formatElapsed(Date.now() - requestStartTime)}: ${streamError.message}`,
          );
          logMemory("stream-error");
          const errorChunk = {
            id: completionId,
            object: "chat.completion.chunk",
            created,
            model,
            choices: [
              {
                index: 0,
                delta: { content: `\n[Error: ${streamError.message}]` },
                finish_reason: "stop",
              },
            ],
          };
          res.write(`data: ${JSON.stringify(errorChunk)}\n\n`);
          res.write("data: [DONE]\n\n");
          res.end();
        } finally {
          clearInterval(heartbeat);
        }

        return;
      } else {
        // Non-streaming mode
        console.log(`[bridge] ⏱️ Starting non-streaming invocation...`);
        const result = await invokeCodebuff({
          messages,
          cwd: DEFAULT_CWD,
          sessionId: openclawSessionId,
          proxyToolFn: openclawSessionId ? callOpenClawGatewayTool : null,
        });
        console.log(
          `[bridge] ⏱️ Non-streaming invocation complete (elapsed: ${formatElapsed(Date.now() - requestStartTime)})`,
        );
        logMemory("invoke-done");

        // Log completion with issue context and one-line summary
        let finishReason = "stop";

        if (result.needsContinuation) {
          // Agent has indicated it needs to continue with more work (via update_subgoal)
          // Do NOT send finish_reason: "stop" - that tells the caller to end the conversation
          // Send "length" to indicate more content is available, or null to let caller decide
          finishReason = "length"; // Signal that agent wants to continue

          if (result.hasSubgoals) {
            console.log(
              `[bridge] 🔄 More work needed: ${issueContext?.identifier || "request"} (active subgoals - continuation required)`,
            );
          } else {
            console.log(
              `[bridge] 🔄 More work needed: ${issueContext?.identifier || "request"} (pending tool calls)`,
            );
          }
        } else if (issueContext) {
          // Extract first line of summary for logging
          const summary = result.text || "";
          const firstLine = summary.split("\n")[0].trim().slice(0, 100) || "(no summary)";
          console.log(`[bridge] ✅ Finished: ${issueContext.identifier} — ${firstLine}`);
        }

        // Extract text content, filtering out tool-call metadata for clean response
        const { text: filteredContent } = extractTextFromResponse(result.text);

        res.writeHead(200, {
          "Content-Type": "application/json",
          "X-Codebuff-Mode": STARTUP_WINNER?.isPaid ? "paid" : "free",
        });
        return res.end(JSON.stringify({
          id: `chatcmpl-${Date.now()}`,
          object: "chat.completion",
          created: Math.floor(Date.now() / 1000),
          model,
          choices: [
            {
              index: 0,
              finish_reason: finishReason,
              message: {
                role: "assistant",
                content: filteredContent ?? "",
              },
            },
          ],
          usage: {
            prompt_tokens: 0,
            completion_tokens: 0,
            total_tokens: 0,
          },
        }));
      }
    } else {
      // 404 for other routes
      sendJson(res, 404, { error: { message: "Not found" } });
    }
  } catch (error) {
    console.error(`[bridge] Error: ${error.message}`);
    sendJson(res, 500, {
      error: {
        message: error instanceof Error ? error.message : String(error),
        type: "server_error",
      },
    });
  }
});

// Graceful shutdown
function shutdown(signal) {
  console.log(`\n[bridge] Received ${signal}, shutting down immediately...`);
  server.close(() => {
    console.log("[bridge] Server closed");
  });
  // Exit immediately without waiting for active connections
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// Initialize at startup - validate key and determine paid/free mode
async function initializeBridge() {
  const apiKey = getApiKey();

  console.log(`[bridge] ========================================`);
  console.log(`[bridge] Codebuff OpenAI Bridge Starting`);
  console.log(`[bridge] ========================================`);
  console.log(`[bridge] Listening: http://127.0.0.1:${PORT}/v1`);
  console.log(`[bridge] Model: ${MODEL_ID}`);
  console.log(`[bridge] API key: ${apiKey ? "configured" : "NOT SET"}`);
  console.log(`[bridge] Auth token: Bearer ${API_KEY.slice(0, 10)}...`);
  console.log(`[bridge] Streaming: enabled`);
  console.log(`[bridge] Working directory: ${DEFAULT_CWD}`);

  if (apiKey) {
    console.log(`[bridge] Testing API key (paid mode first, then free)...`);
    await testKeyAndSelectWinner(apiKey);
  } else {
    console.warn(`[bridge] WARNING: CODEBUFF_API_KEY not set!`);
  }

  STARTUP_INITIALIZED = true;
  console.log(`[bridge] ========================================`);
  console.log(`[bridge] Ready to accept requests`);
  console.log(`[bridge] ========================================`);
}

// Health check - include initialization status
function getHealthStatus() {
  return {
    status: STARTUP_INITIALIZED ? "ok" : "initializing",
    model: MODEL_ID,
    apiKeyConfigured: !!getApiKey(),
    mode: STARTUP_WINNER?.isPaid ? "paid" : STARTUP_WINNER ? "free" : "none",
  };
}

// Start server
server.listen(PORT, "127.0.0.1", async () => {
  await initializeBridge();
});

// Export for testing
export { invokeCodebuff, invokeCodebuffStream, getApiKey, MODEL_ID };
