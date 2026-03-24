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
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CodebuffClient } from "@codebuff/sdk";
import { isTextUIPart, isReasoningUIPart, isToolUIPart, isDataUIPart } from "ai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../../../../");

const PORT = process.env.CODEBUFF_BRIDGE_PORT || 4318;
const API_KEY = process.env.CODEBUFF_BRIDGE_API_KEY || "local-bridge";
const MODEL_ID = process.env.CODEBUFF_MODEL_ID || "codebuff/base";
const TIMEOUT_MS = 10 * 60 * 1000; // increased from 5min to 10min to match runner timeout
const DEFAULT_CWD = process.env.CODEBUFF_BRIDGE_CWD || PROJECT_ROOT;

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

    // Free mode also failed
    console.warn(`[bridge] Key ${index + 1} (${masked}): ❌ out of credits (both paid and free)`);
    return { works: false, mode: null };
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

  console.warn(`[bridge] Key ${index + 1} (${masked}): ❌ both modes failed`);
  return { works: false, mode: null };
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

  // Key failed - set as fallback anyway (will fail at runtime with clear error)
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

// Check if error is an auth error
function isAuthError(errStr) {
  return (
    errStr.includes("401") ||
    errStr.includes("403") ||
    errStr.includes("Unauthorized") ||
    errStr.includes("Forbidden") ||
    errStr.includes("Authentication failed")
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

// Check if a tool call indicates active (non-complete) subgoals
function hasActiveSubgoals(content) {
  if (!Array.isArray(content)) return false;

  for (const item of content) {
    const toolName = item.toolName || item.name;
    if (toolName === "update_subgoal" || toolName === "add_subgoal") {
      // Check the input status - COMPLETE means work is done, not ongoing
      const input = item.input || item.args;
      const status = (input?.status || "").toUpperCase();

      // Only count as active if status is IN_PROGRESS or NOT_STARTED
      // COMPLETE means the agent finished that task
      if (status === "IN_PROGRESS" || status === "NOT_STARTED") {
        return true;
      }
    }
  }
  return false;
}

// Parse agent response to detect subgoals and continuation needs
function parseAgentResponse(resultStr) {
  try {
    // Try to parse as JSON first (structured response)
    let parsed = null;
    try {
      parsed = JSON.parse(resultStr);
    } catch {
      // Not JSON, check string directly
    }

    // Check for structured lastMessage with update_subgoal
    if (parsed && parsed.type === "lastMessage" && parsed.value) {
      const messages = Array.isArray(parsed.value) ? parsed.value : [parsed.value];
      for (const msg of messages) {
        if (msg.role === "assistant") {
          // Handle content as array
          if (Array.isArray(msg.content) && hasActiveSubgoals(msg.content)) {
            return {
              needsContinuation: true,
              hasSubgoals: true,
              subgoalInfo: JSON.stringify(msg.content, null, 2),
            };
          }
          // Handle content as object (nested in extra or other fields)
          if (msg.content && typeof msg.content === "object") {
            // Check if content has a nested array with tool calls
            for (const key of Object.keys(msg.content)) {
              const val = msg.content[key];
              if (Array.isArray(val) && hasActiveSubgoals(val)) {
                return {
                  needsContinuation: true,
                  hasSubgoals: true,
                  subgoalInfo: JSON.stringify(val, null, 2),
                };
              }
            }
          }
        }
      }
    }

    // Fallback: check string directly for update_subgoal with IN_PROGRESS or NOT_STARTED status
    // This handles cases where the JSON parsing fails but the string contains the data
    if (
      resultStr.includes('"toolName":"update_subgoal"') ||
      resultStr.includes('"toolName":"add_subgoal"')
    ) {
      // Check if there's a non-COMPLETE status in the response
      const hasActiveStatus =
        resultStr.includes('"status":"IN_PROGRESS"') ||
        resultStr.includes('"status":"NOT_STARTED"') ||
        resultStr.includes('status":"IN_PROGRESS"') ||
        resultStr.includes('status":"NOT_STARTED"');

      // If we found update_subgoal but no active status, don't signal continuation
      // (the agent completed the subgoals)
      if (!hasActiveStatus) {
        // Still check if it looks like there's more work to do by looking for tool-call without end_turn
        if (resultStr.includes('"type":"tool-call"') && !resultStr.includes("end_turn")) {
          return {
            needsContinuation: true,
            hasSubgoals: false,
            subgoalInfo: null,
          };
        }
        return {
          needsContinuation: false,
          hasSubgoals: true, // Subgoals exist but are complete
          subgoalInfo: null,
        };
      }

      return {
        needsContinuation: true,
        hasSubgoals: true,
        subgoalInfo: null,
      };
    }

    // Check for other continuation signals (tool calls without end_turn)
    if (resultStr.includes('"type":"tool-call"') && !resultStr.includes("end_turn")) {
      return {
        needsContinuation: true,
        hasSubgoals: false,
        subgoalInfo: null,
      };
    }

    return {
      needsContinuation: false,
      hasSubgoals: false,
      subgoalInfo: null,
    };
  } catch (err) {
    console.warn(`[bridge] parseAgentResponse error: ${err.message}`);
    return {
      needsContinuation: false,
      hasSubgoals: false,
      subgoalInfo: null,
    };
  }
}

// Try a single account - helper for parallel execution
async function trySingleAccount(attempt, prompt, timeoutPromise, cwd) {
  const toolsUsed = new Set();

  const client = new CodebuffClient({
    apiKey: attempt.apiKey,
    cwd: cwd || DEFAULT_CWD,
  });

  const runOpts = {
    agent: MODEL_ID,
    prompt,
    handleEvent: (event) => {
      if (event && event.type === "tool-call") {
        const toolName = event.toolName || event.name || "unknown";
        if (!toolsUsed.has(toolName)) {
          toolsUsed.add(toolName);
          console.log(`[bridge] 🔧 Tool used: ${toolName}`);
        }
      }
      if (event && event.type === "reasoning") {
        const preview = event.content?.slice(0, 80) || "";
        console.log(`[bridge] 🤔 Reasoning: ${preview}...`);
      }
    },
    maxAgentSteps: 50,
  };

  if (attempt.costMode) {
    runOpts.costMode = attempt.costMode;
  }

  const result = await suppressSDKErrors(() =>
    Promise.race([client.run(runOpts), timeoutPromise]),
  )();

  const output = result.output;
  const resultStr = typeof output === "string" ? output : JSON.stringify(output);

  if (resultStr.includes("Symbol(vercel.ai.error)")) {
    const errorMatch = resultStr.match(/"message":"([^"]+)"/);
    const cleanError = errorMatch ? errorMatch[1] : "SDK error (output parsing failed)";
    throw new Error(cleanError);
  }

  if (isRateLimitError(resultStr)) {
    const resetMatch = resultStr.match(/(\d+)\s*(day|hour|minute)/);
    const resetInfo = resetMatch ? ` (resets in ${resetMatch[0]})` : "";
    throw new Error(`Rate limited on ${attempt.label}${resetInfo}`);
  }
  if (isAuthError(resultStr)) {
    throw new Error(`Auth failed on ${attempt.label}`);
  }

  console.log(`[bridge] ✅ Success on ${attempt.label}`);

  if (toolsUsed.size > 0) {
    console.log(`[bridge] 📊 Tools used: ${Array.from(toolsUsed).join(", ")}`);
  } else {
    console.log(`[bridge] 📊 Tools used: none (text-only mode)`);
  }

  const parseResult = parseAgentResponse(resultStr);

  if (parseResult.needsContinuation) {
    const contMsg = parseResult.hasSubgoals ? " (active subgoals)" : "";
    console.log(`[bridge] 🔄 Agent indicates continuation needed${contMsg}`);
  }

  return {
    text: resultStr,
    account: attempt.label,
    isPaid: attempt.isPaid,
    needsContinuation: parseResult.needsContinuation,
    hasSubgoals: parseResult.hasSubgoals,
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

// Use pre-warmed winner directly
async function invokeCodebuff({ messages, cwd }) {
  if (Date.now() - lastRevalidationTime > REVALIDATION_INTERVAL_MS) {
    console.log(`[bridge] ⏰ Time-based re-validation triggered`);
    await revalidateAndSelectWinner();
  }

  const winner = getWinner();
  console.log(`[bridge] Using: ${winner.label}`);

  const prompt = buildPrompt(messages);
  return trySingleAccount(
    winner,
    prompt,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Timeout after ${TIMEOUT_MS}ms`)), TIMEOUT_MS);
    }),
    cwd,
  );
}

// Try a single account for streaming - helper for parallel execution
async function trySingleAccountStream(
  attempt,
  prompt,
  timeoutPromise,
  cwd,
  onChunk,
  completionId,
  created,
) {
  let fullText = "";
  const toolsUsed = new Set();

  const client = new CodebuffClient({
    apiKey: attempt.apiKey,
    cwd: cwd || DEFAULT_CWD,
  });

  const runOpts = {
    agent: MODEL_ID,
    prompt,
    handleEvent: (event) => {
      if (event && event.type === "tool-call") {
        const toolName = event.toolName || event.name || "unknown";
        if (!toolsUsed.has(toolName)) {
          toolsUsed.add(toolName);
          console.log(`[bridge] 🔧 Tool used: ${toolName}`);
        }
      }
      if (event && event.type === "reasoning") {
        const preview = event.content?.slice(0, 80) || "";
        console.log(`[bridge] 🤔 Reasoning: ${preview}...`);
      }
      // Stream any output events as they come in - filter out tool-call metadata
      if (event && event.type === "output" && event.content) {
        fullText += event.content;
        // Filter the content to remove tool-call metadata before streaming
        const { text: filteredContent } = extractTextFromResponse(event.content);
        if (filteredContent) {
          const chunk = {
            id: completionId,
            object: "chat.completion.chunk",
            created,
            model: MODEL_ID,
            choices: [
              {
                index: 0,
                delta: { content: filteredContent },
                finish_reason: null,
              },
            ],
          };
          onChunk(chunk);
        }
      }
    },
    maxAgentSteps: 50,
  };

  if (attempt.costMode) {
    runOpts.costMode = attempt.costMode;
  }

  const result = await suppressSDKErrors(() =>
    Promise.race([client.run(runOpts), timeoutPromise]),
  )();

  const output = result.output || "";
  const resultStr = typeof output === "string" ? output : JSON.stringify(output);

  if (resultStr.includes("Symbol(vercel.ai.error)")) {
    const errorMatch = resultStr.match(/"message":"([^"]+)"/);
    const cleanError = errorMatch ? errorMatch[1] : "SDK error (output parsing failed)";
    throw new Error(cleanError);
  }

  if (isRateLimitError(resultStr)) {
    const resetMatch = resultStr.match(/(\d+)\s*(day|hour|minute)/);
    const resetInfo = resetMatch ? ` (resets in ${resetMatch[0]})` : "";
    throw new Error(`Rate limited on ${attempt.label}${resetInfo}`);
  }
  if (isAuthError(resultStr)) {
    throw new Error(`Auth failed on ${attempt.label}`);
  }

  console.log(`[bridge] ✅ Success on ${attempt.label}`);

  // Send any remaining output - filter out tool-call metadata
  if (typeof output === "string" && output.length > 0) {
    const remaining = output.slice(fullText.length);
    if (remaining) {
      // Filter the remaining content to remove tool-call metadata
      const { text: filteredRemaining } = extractTextFromResponse(remaining);
      if (filteredRemaining) {
        const chunk = {
          id: completionId,
          object: "chat.completion.chunk",
          created,
          model: MODEL_ID,
          choices: [
            {
              index: 0,
              delta: { content: filteredRemaining },
              finish_reason: null,
            },
          ],
        };
        onChunk(chunk);
      }
    }
  }

  if (toolsUsed.size > 0) {
    console.log(`[bridge] 📊 Tools used: ${Array.from(toolsUsed).join(", ")}`);
  } else {
    console.log(`[bridge] 📊 Tools used: none (text-only mode)`);
  }

  const parseResult = parseAgentResponse(resultStr);

  if (parseResult.needsContinuation) {
    const contMsg = parseResult.hasSubgoals ? " (active subgoals)" : "";
    console.log(`[bridge] 🔄 Agent indicates continuation needed${contMsg}`);
  }

  return {
    text: fullText || resultStr,
    account: attempt.label,
    isPaid: attempt.isPaid,
    needsContinuation: parseResult.needsContinuation,
    hasSubgoals: parseResult.hasSubgoals,
    hadStreamingChunks: fullText.length > 0, // Track if any chunks were streamed during execution
  };
}

// Use pre-warmed winner directly for streaming
async function invokeCodebuffStream({ messages, cwd, onChunk, completionId, created }) {
  if (Date.now() - lastRevalidationTime > REVALIDATION_INTERVAL_MS) {
    console.log(`[bridge] ⏰ Time-based re-validation triggered (streaming)`);
    await revalidateAndSelectWinner();
  }

  const winner = getWinner();
  console.log(`[bridge] Streaming: Using ${winner.label}`);

  const prompt = buildPrompt(messages);
  return trySingleAccountStream(
    winner,
    prompt,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Timeout after ${TIMEOUT_MS}ms`)), TIMEOUT_MS);
    }),
    cwd,
    onChunk,
    completionId,
    created,
  );
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
  console.log(`[bridge] ===================`);

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
        });

        const completionId = `chatcmpl-${Date.now()}`;
        const created = Math.floor(Date.now() / 1000);

        let streamResult = null;

        try {
          console.log(`[bridge] ⏱️ Starting streaming invocation...`);
          streamResult = await invokeCodebuffStream({
            messages,
            cwd: DEFAULT_CWD,
            completionId,
            created,
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

          // ALWAYS filter the text content to remove tool-call metadata, regardless of streaming mode
          // This ensures clean output in both text-only mode and streaming output events mode
          if (streamResult?.text && streamResult.text.length > 0) {
            // Extract actual text content from the JSON response, filtering out tool-call metadata
            const { text: textContent } = extractTextFromResponse(streamResult.text);
            if (textContent) {
              // Only send if we didn't already stream during execution (avoid duplicates)
              if (streamResult.hadStreamingChunks) {
                // Already streamed during execution - log what was filtered
                console.log(
                  `[bridge] 📝 Filtered content (already streamed: ${streamResult.hadStreamingChunks})`,
                );
              } else {
                const contentChunk = {
                  id: completionId,
                  object: "chat.completion.chunk",
                  created,
                  model,
                  choices: [
                    {
                      index: 0,
                      delta: { content: textContent },
                      finish_reason: null,
                    },
                  ],
                };
                res.write(`data: ${JSON.stringify(contentChunk)}\n\n`);
              }
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
        }

        return;
      } else {
        // Non-streaming mode
        console.log(`[bridge] ⏱️ Starting non-streaming invocation...`);
        const result = await invokeCodebuff({
          messages,
          cwd: DEFAULT_CWD,
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

        // Extract actual text content, filtering out tool-call metadata
        const { text: filteredContent } = extractTextFromResponse(result.text);

        return sendJson(res, 200, {
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
        });
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
  console.log(`\n[bridge] Received ${signal}, shutting down...`);
  server.close(() => {
    console.log("[bridge] Server closed");
    process.exit(0);
  });
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
