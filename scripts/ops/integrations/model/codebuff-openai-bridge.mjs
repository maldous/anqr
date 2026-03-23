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
 *   CODEBUFF_API_KEY          — Required: Codebuff API key for SDK calls
 *   CODEBUFF_API_KEY2         — Optional: fallback key
 *   CODEBUFF_API_KEY3         — Optional: additional key
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CodebuffClient, WEBSITE_URL } from "@codebuff/sdk";
import { isTextUIPart, isReasoningUIPart, isToolUIPart, isDataUIPart } from "ai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../../../../");

const PORT = process.env.CODEBUFF_BRIDGE_PORT || 4318;
const API_KEY = process.env.CODEBUFF_BRIDGE_API_KEY || "local-bridge";
const MODEL_ID = process.env.CODEBUFF_MODEL_ID || "codebuff/base";
const TIMEOUT_MS = 10 * 60 * 1000; // increased from 5min to 10min to match runner timeout
const DEFAULT_CWD = process.env.CODEBUFF_BRIDGE_CWD || PROJECT_ROOT;

// Re-validation interval - check keys at least 4 times a day (every 6 hours)
const REVALIDATION_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours
let lastRevalidationTime = Date.now();

// Pre-computed at startup - validated accounts and attempt plan
let STARTUP_ACCOUNTS = [];
let STARTUP_ATTEMPTS = [];
let STARTUP_INITIALIZED = false;
let STARTUP_WINNER = null; // Pre-selected winning key for fast requests

// Get all Codebuff API keys from environment
function getAllApiKeys() {
  const keys = [];

  for (const key of Object.keys(process.env).sort()) {
    if (key.startsWith("CODEBUFF_API_KEY") && !key.endsWith("_FILE")) {
      const value = process.env[key];
      if (value) keys.push(value);
    }
  }

  // Check .env file
  const envPath = path.join(PROJECT_ROOT, ".env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    const regex = /CODEBUFF_API_KEY\d*=(?:"([^"]+)"|([^\s]+))/g;
    let match;
    while ((match = regex.exec(envContent)) !== null) {
      const key = match[1] || match[2];
      if (key && !keys.includes(key)) {
        keys.push(key);
      }
    }
  }

  return keys;
}

// Resolve account info for an API key
async function resolveKeyAccount(apiKey) {
  try {
    const url = new URL("/api/v1/me?fields=id,email", WEBSITE_URL);
    const res = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return { id: data.id, email: data.email };
  } catch {
    return null;
  }
}

// Validate API keys - ensure they belong to different accounts
async function validateApiKeys(apiKeys) {
  const results = await Promise.allSettled(apiKeys.map((k) => resolveKeyAccount(k)));
  const accounts = [];
  for (let i = 0; i < apiKeys.length; i++) {
    const result = results[i];
    const info = result.status === "fulfilled" ? result.value : null;
    const masked = apiKeys[i].slice(0, 6) + "..." + apiKeys[i].slice(-4);
    if (info) {
      accounts.push({ index: i, ...info });
      console.log(`[bridge] Key ${i + 1} (${masked}): ${info.email}`);
    } else {
      console.warn(`[bridge] Key ${i + 1} (${masked}): could not resolve account (auth error?)`);
    }
  }

  const uniqueIds = new Set(accounts.map((a) => a.id));
  if (accounts.length > 1 && uniqueIds.size < accounts.length) {
    console.warn(`[bridge] WARNING: Multiple keys resolve to the SAME account.`);
    console.warn(`[bridge] Rate-limit rotation will NOT help — limits are per-account.`);
    console.warn(`[bridge] Use keys from different Codebuff accounts for effective rotation.`);
  } else if (uniqueIds.size > 1) {
    console.log(`[bridge] ${uniqueIds.size} distinct accounts confirmed — rotation enabled.`);
  }

  return accounts;
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

// Test API key functionality at startup with a minimal request
async function testApiKey(apiKey, index) {
  const masked = apiKey.slice(0, 6) + "..." + apiKey.slice(-4);
  const client = new CodebuffClient({
    apiKey,
    cwd: DEFAULT_CWD,
  });

  try {
    // Try a minimal run with very low steps to verify key works
    const result = await Promise.race([
      client.run({
        agent: MODEL_ID,
        prompt: "Say 'ok' if you can read this.",
        maxAgentSteps: 1,
      }),
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
      console.warn(`[bridge] Key ${index + 1} (${masked}): FAILED - auth error`);
      return false;
    }

    // Check for rate limit errors - these should NOT be considered "working"
    if (isRateLimitError(outputStr)) {
      const resetMatch = outputStr.match(/resets in (\d+ \w+)/);
      const resetInfo = resetMatch ? ` (resets in ${resetMatch[1]})` : "";
      console.warn(`[bridge] Key ${index + 1} (${masked}): FAILED - rate limited${resetInfo}`);
      return false;
    }

    console.log(`[bridge] Key ${index + 1} (${masked}): ✅ working`);
    return true;
  } catch (err) {
    const errStr = err.message || String(err);

    // Check for auth errors
    if (errStr.includes("401") || errStr.includes("Unauthorized") || errStr.includes("auth")) {
      console.warn(`[bridge] Key ${index + 1} (${masked}): ❌ auth failed`);
      return false;
    }

    // Check for rate limit errors
    if (isRateLimitError(errStr)) {
      const resetMatch = errStr.match(/resets in (\d+ \w+)/);
      const resetInfo = resetMatch ? ` (resets in ${resetMatch[1]})` : "";
      console.warn(`[bridge] Key ${index + 1} (${masked}): ❌ rate limited${resetInfo}`);
      return false;
    }

    // Timeout means the key is NOT working (can't complete even a simple request)
    if (errStr.toLowerCase().includes("timeout")) {
      console.warn(`[bridge] Key ${index + 1} (${masked}): ❌ timed out`);
      return false;
    }

    // Other errors might mean the key is valid but slow
    console.log(
      `[bridge] Key ${index + 1} (${masked}): ⚠️  test completed (${errStr.slice(0, 50)})`,
    );
    return true; // Assume working if not an auth, rate limit, or timeout
  }
}

// Test ALL keys in parallel at startup and determine the winning key
async function testAllKeysAndSelectWinner(apiKeys) {
  console.log(`[bridge] Testing ALL ${apiKeys.length} API keys in parallel...`);

  // Test ALL keys in parallel at startup
  const results = await Promise.allSettled(apiKeys.map((key, i) => testApiKey(key, i)));

  // Check if paid (index 0) works
  const paidWorks = results[0]?.status === "fulfilled" && results[0]?.value === true;

  if (paidWorks) {
    console.log(`[bridge] 🎯 Winner: paid key (will use directly on requests)`);
    STARTUP_WINNER = {
      apiKey: apiKeys[0],
      costMode: undefined,
      label: "paid (pre-warmed)",
      isPaid: true,
    };
    return;
  }

  // Paid doesn't work - find first working free key
  for (let i = 1; i < results.length; i++) {
    if (results[i]?.status === "fulfilled" && results[i]?.value === true) {
      console.log(`[bridge] 🎯 Winner: free key ${i} (will use directly on requests)`);
      STARTUP_WINNER = {
        apiKey: apiKeys[i],
        costMode: "free",
        label: `free key ${i} (pre-warmed)`,
        isPaid: false,
      };
      return;
    }
  }

  // All keys failed - fallback to paid (will fail at runtime)
  console.warn(`[bridge] ⚠️  All keys failed at startup - using paid as fallback`);
  STARTUP_WINNER = {
    apiKey: apiKeys[0],
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

// Build parallel attempt plan: all accounts try simultaneously
// First key: paid mode, others: free mode
function buildAttemptPlan(apiKeys, accounts) {
  const attempts = [];

  for (let i = 0; i < apiKeys.length; i++) {
    const acct = accounts.find((a) => a.index === i);
    const email = acct ? acct.email : `key ${i + 1}`;
    const apiKey = apiKeys[i];

    // First key: paid mode, others: free mode
    if (i === 0) {
      attempts.push({ apiKey, costMode: undefined, label: `${email} (paid)`, isPaid: true });
    } else {
      attempts.push({ apiKey, costMode: "free", label: `${email} (free)`, isPaid: false });
    }
  }

  return attempts;
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
// Also checks if re-validation is needed (e.g., after paid rate limit cooldown)
function getWinner() {
  if (!STARTUP_INITIALIZED) {
    throw new Error("Bridge not initialized - startup validation not complete");
  }
  if (!STARTUP_WINNER) {
    throw new Error("No winner selected - startup tests not complete");
  }

  // Check if we need to re-validate the winner (time-based or after rate limit)
  const timeSinceLastRevalidation = Date.now() - lastRevalidationTime;
  const needsRevalidation = timeSinceLastRevalidation > REVALIDATION_INTERVAL_MS;

  if (needsRevalidation) {
    console.log(`[bridge] 🔄 Re-validation needed: ${Math.round(timeSinceLastRevalidation/3600000)}h since last check`);
    console.log(`[bridge] 🔄 Will re-test API keys to find the best available one`);
  }

  return STARTUP_WINNER;
}

// Re-validate and potentially switch to a better key
async function revalidateAndSelectWinner() {
  const apiKeys = getAllApiKeys();
  if (apiKeys.length === 0) {
    console.warn(`[bridge] No API keys available for re-validation`);
    return;
  }

  console.log(`[bridge] 🔄 Re-validating ${apiKeys.length} API keys...`);
  lastRevalidationTime = Date.now();

  // Test all keys again to find the best available one
  await testAllKeysAndSelectWinner(apiKeys);

  if (STARTUP_WINNER) {
    console.log(`[bridge] 🔄 Re-validation complete: selected ${STARTUP_WINNER.label}`);
  }
}

// Use pre-warmed winner directly (fast path - no parallel fallback)
async function invokeCodebuff({ messages, cwd }) {
  const timeSinceLastRevalidation = Date.now() - lastRevalidationTime;
  
  // Check if re-validation is needed before using the winner
  if (timeSinceLastRevalidation > REVALIDATION_INTERVAL_MS) {
    console.log(`[bridge] ⏰ Time-based re-validation triggered`);
    await revalidateAndSelectWinner();
  }

  const winner = getWinner();
  console.log(`[bridge] Using pre-warmed winner: ${winner.label}`);

  const prompt = buildPrompt(messages);
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Timeout after ${TIMEOUT_MS}ms`)), TIMEOUT_MS);
  });

  // Use winner directly - no fallback
  try {
    const result = await trySingleAccount(winner, prompt, timeoutPromise, cwd);
    console.log(`[bridge] ✅ Winner succeeded`);
    return result;
  } catch (err) {
    console.error(`[bridge] ❌ Winner failed: ${err.message}`);
    throw err;
  }
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

// Use pre-warmed winner directly for streaming (fast path - no parallel fallback)
async function invokeCodebuffStream({ messages, cwd, onChunk, completionId, created }) {
  const timeSinceLastRevalidation = Date.now() - lastRevalidationTime;
  
  // Check if re-validation is needed before using the winner
  if (timeSinceLastRevalidation > REVALIDATION_INTERVAL_MS) {
    console.log(`[bridge] ⏰ Time-based re-validation triggered (streaming)`);
    await revalidateAndSelectWinner();
  }

  const winner = getWinner();
  console.log(`[bridge] Streaming: Using pre-warmed winner: ${winner.label}`);

  const prompt = buildPrompt(messages);
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Timeout after ${TIMEOUT_MS}ms`)), TIMEOUT_MS);
  });

  // Use winner directly - no fallback
  try {
    const result = await trySingleAccountStream(
      winner,
      prompt,
      timeoutPromise,
      cwd,
      onChunk,
      completionId,
      created,
    );
    console.log(`[bridge] ✅ Winner succeeded`);
    return result;
  } catch (err) {
    console.error(`[bridge] ❌ Winner failed: ${err.message}`);
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
          console.error(`[bridge] Streaming error: ${streamError.message}`);
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
        const result = await invokeCodebuff({
          messages,
          cwd: DEFAULT_CWD,
        });

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
        } else {
          if (issueContext) {
            // Extract first line of summary for logging
            const summary = result.text || "";
            const firstLine = summary.split("\n")[0].trim().slice(0, 100) || "(no summary)";
            console.log(`[bridge] ✅ Finished: ${issueContext.identifier} — ${firstLine}`);
          }
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

// Initialize at startup - validate keys and build attempt plan
async function initializeBridge() {
  const apiKeys = getAllApiKeys();

  console.log(`[bridge] ========================================`);
  console.log(`[bridge] Codebuff OpenAI Bridge Starting`);
  console.log(`[bridge] ========================================`);
  console.log(`[bridge] Listening: http://127.0.0.1:${PORT}/v1`);
  console.log(`[bridge] Model: ${MODEL_ID}`);
  console.log(`[bridge] API keys configured: ${apiKeys.length}`);
  console.log(`[bridge] Auth token: Bearer ${API_KEY.slice(0, 10)}...`);
  console.log(`[bridge] Streaming: enabled`);
  console.log(`[bridge] Working directory: ${DEFAULT_CWD}`);

  // Validate and determine paid/free at startup
  if (apiKeys.length > 0) {
    console.log(`[bridge] Validating API keys and determining paid/free status...`);
    STARTUP_ACCOUNTS = await validateApiKeys(apiKeys);

    if (STARTUP_ACCOUNTS.length === 0) {
      console.warn(`[bridge] WARNING: No valid API keys found!`);
    } else {
      // Build the attempt plan once at startup
      STARTUP_ATTEMPTS = buildAttemptPlan(apiKeys, STARTUP_ACCOUNTS);

      // Test keys and pre-select winner for fast requests
      await testAllKeysAndSelectWinner(apiKeys);
    }
  } else {
    console.warn(`[bridge] WARNING: No CODEBUFF_API_KEY* environment variables found!`);
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
    apiKeysConfigured: STARTUP_ACCOUNTS.length,
    paidAccounts: STARTUP_ATTEMPTS.filter((a) => a.isPaid).length,
    freeAccounts: STARTUP_ATTEMPTS.filter((a) => !a.isPaid).length,
  };
}

// Start server
server.listen(PORT, "127.0.0.1", async () => {
  await initializeBridge();
});

// Export for testing
export { invokeCodebuff, invokeCodebuffStream, getAllApiKeys, MODEL_ID };
