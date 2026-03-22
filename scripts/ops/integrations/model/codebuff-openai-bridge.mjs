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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../../../../");

const PORT = process.env.CODEBUFF_BRIDGE_PORT || 4318;
const API_KEY = process.env.CODEBUFF_BRIDGE_API_KEY || "local-bridge";
const MODEL_ID = process.env.CODEBUFF_MODEL_ID || "codebuff/base";
const TIMEOUT_MS = 5 * 60 * 1000;
const DEFAULT_CWD = process.env.CODEBUFF_BRIDGE_CWD || PROJECT_ROOT;



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

// Build ordered attempt plan: one attempt per account
// Order: KEY1 paid -> KEY2 free -> KEY3 free (no retry with free on same account)
function buildAttemptPlan(apiKeys, accounts) {
  const attempts = [];

  for (let i = 0; i < apiKeys.length; i++) {
    const acct = accounts.find((a) => a.index === i);
    const email = acct ? acct.email : `key ${i + 1}`;
    const apiKey = apiKeys[i];

    // First key: paid mode, others: free mode
    if (i === 0) {
      attempts.push({ apiKey, costMode: undefined, label: `${email} (paid)` });
    } else {
      attempts.push({ apiKey, costMode: "free", label: `${email} (free)` });
    }
  }

  return attempts;
}

// Delay between key rotation attempts
const INTER_KEY_DELAY_MS = 0;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Check if error is a retryable rate limit
function isRateLimitError(errStr) {
  const s = errStr.toLowerCase();
  return (
    s.includes("429") ||
    s.includes("rate_limit") ||
    s.includes("too many requests") ||
    s.includes("session limit") ||
    s.includes("rate_limit_exceeded") ||
    s.includes("weekly limit") ||
    s.includes("limit resets") ||
    s.includes("continue with credits") ||
    s.includes("subscription")
  );
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
      const errStr = String(errArgs[0] || '');
      // Only suppress Vercel AI SDK error dumps
      if (errStr.includes('Symbol(vercel.ai.error)')) {
        return;
      }
      originalError(...errArgs);
    };
    console.warn = (...warnArgs) => {
      const warnStr = String(warnArgs[0] || '');
      // Suppress tools.profile allowlist warnings - these are SDK internal notices
      // about tools that are unavailable in current runtime/model config
      if (warnStr.includes('tools.profile') && warnStr.includes('allowlist contains unknown entries')) {
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
    if (parsed && parsed.type === 'lastMessage' && parsed.value) {
      const messages = Array.isArray(parsed.value) ? parsed.value : [parsed.value];
      for (const msg of messages) {
        if (msg.role === 'assistant' && Array.isArray(msg.content)) {
          const hasSubgoals = msg.content.some(item => 
            item.toolName === 'update_subgoal' || item.toolName === 'add_subgoal'
          );
          if (hasSubgoals) {
            return {
              needsContinuation: true,
              hasSubgoals: true,
              subgoalInfo: JSON.stringify(msg.content, null, 2)
            };
          }
        }
      }
    }

    // Fallback: check string directly for update_subgoal tool calls
    if (resultStr.includes('"toolName":"update_subgoal"') || resultStr.includes('"toolName":"add_subgoal"')) {
      return {
        needsContinuation: true,
        hasSubgoals: true,
        subgoalInfo: null
      };
    }
    
    // Check for other continuation signals (tool calls without end_turn)
    if (resultStr.includes('"type":"tool-call"') && !resultStr.includes('end_turn')) {
      return {
        needsContinuation: true,
        hasSubgoals: false,
        subgoalInfo: null
      };
    }
    
    return {
      needsContinuation: false,
      hasSubgoals: false,
      subgoalInfo: null
    };
  } catch (err) {
    console.warn(`[bridge] parseAgentResponse error: ${err.message}`);
    return {
      needsContinuation: false,
      hasSubgoals: false,
      subgoalInfo: null
    };
  }
}

// Try each API key until one works (non-streaming) - with full key rotation
async function invokeCodebuff({ messages, cwd }) {
  const apiKeys = getAllApiKeys();

  if (apiKeys.length === 0) {
    throw new Error("No CODEBUFF_API_KEY* found in environment");
  }

  // Pre-flight: validate keys belong to different accounts
  const accounts = await validateApiKeys(apiKeys);

  // Build ordered attempt plan: paid -> free -> free (always start fresh)
  const attempts = buildAttemptPlan(apiKeys, accounts);
  console.log(
    `[bridge] Attempt plan (${attempts.length} attempts): ${attempts.map((a) => a.label).join(" → ")}`,
  );

  const prompt = buildPrompt(messages);
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Timeout after ${TIMEOUT_MS}ms`)), TIMEOUT_MS);
  });

  let lastError = null;

  // Try each attempt in order
  for (let i = 0; i < attempts.length; i++) {
    const attempt = attempts[i];
    console.log(`[bridge] Attempt ${i + 1}/${attempts.length}: ${attempt.label}...`);

    // Delay between attempts (except first)
    if (i > 0) {
      console.log(`[bridge] Waiting ${INTER_KEY_DELAY_MS / 1000}s before next attempt...`);
      await sleep(INTER_KEY_DELAY_MS);
    }

    try {
      const toolsUsed = new Set();
      
      const client = new CodebuffClient({
        apiKey: attempt.apiKey,
        cwd: cwd || DEFAULT_CWD,
      });

      const runOpts = {
        agent: MODEL_ID,
        prompt,
        handleEvent: (event) => {
          // Track and log tool usage
          if (event && event.type === 'tool-call') {
            const toolName = event.toolName || event.name || 'unknown';
            if (!toolsUsed.has(toolName)) {
              toolsUsed.add(toolName);
              console.log(`[bridge] 🔧 Tool used: ${toolName}`);
            }
          }
          // Log agent reasoning
          if (event && event.type === 'reasoning') {
            const preview = event.content?.slice(0, 80) || '';
            console.log(`[bridge] 🤔 Reasoning: ${preview}...`);
          }
        },
        maxAgentSteps: 50,
      };

      // Apply cost mode (paid or free)
      if (attempt.costMode) {
        runOpts.costMode = attempt.costMode;
      }

      const result = await suppressSDKErrors(() => Promise.race([client.run(runOpts), timeoutPromise]))();

      const output = result.output;
      const resultStr = typeof output === "string" ? output : JSON.stringify(output);

      // Suppress SDK error dumps by catching them at the output level
      if (resultStr.includes("Symbol(vercel.ai.error)")) {
        const errorMatch = resultStr.match(/"message":"([^"]+)"/);
        const cleanError = errorMatch ? errorMatch[1] : "SDK error (output parsing failed)";
        throw new Error(cleanError);
      }

      // Check for rate limit in output (not just errors)
      if (isRateLimitError(resultStr)) {
        const resetMatch = resultStr.match(/(\d+)\s*(day|hour|minute)/);
        const resetInfo = resetMatch ? ` (resets in ${resetMatch[0]})` : "";
        lastError = resultStr.slice(0, 500);
        console.log(`[bridge] ⏸️  Rate limited on ${attempt.label}${resetInfo}`);
        continue;
      }
      if (isAuthError(resultStr)) {
        lastError = resultStr.slice(0, 500);
        console.warn(`[bridge] ❌ Auth failed on ${attempt.label}`);
        continue;
      }

      console.log(`[bridge] ✅ Success on ${attempt.label}`);
      
      // Log summary of tools used
      if (toolsUsed.size > 0) {
        console.log(`[bridge] 📊 Tools used: ${Array.from(toolsUsed).join(', ')}`);
      } else {
        console.log(`[bridge] 📊 Tools used: none (text-only mode)`);
      }
      
      // Parse response to detect continuation needs
      const parseResult = parseAgentResponse(resultStr);
      
      return {
        text: resultStr,
        account: attempt.label,
        needsContinuation: parseResult.needsContinuation,
        hasSubgoals: parseResult.hasSubgoals,
      };
    } catch (err) {
      // Extract error details - suppress verbose SDK dumps
      const errStr = err.message || String(err);
      const errJson = err.responseBody ? JSON.parse(err.responseBody) : null;
      lastError = errStr;

      // Extract human-readable error message
      const cleanMessage = errJson?.message || errStr;

      if (isAuthError(errStr)) {
        console.warn(`[bridge] ❌ Auth failed on ${attempt.label}: ${cleanMessage.slice(0, 150)}`);
        continue;
      }

      if (isRateLimitError(errStr)) {
        // Extract reset time if available
        const resetMatch = cleanMessage.match(/(\d+)\s*(day|hour|minute)/);
        const resetInfo = resetMatch ? ` (resets in ${resetMatch[0]})` : "";
        console.log(`[bridge] ⏸️  Rate limited on ${attempt.label}${resetInfo}`);
        if (errJson?.message) {
          console.log(`[bridge]    Reason: ${errJson.message}`);
        }
        continue;
      }

      // Non-retryable error - log concisely and re-throw
      console.error(`[bridge] ❌ Fatal error on ${attempt.label}: ${cleanMessage.slice(0, 200)}`);
      throw err;
    }
  }

  throw new Error(`All ${attempts.length} attempts failed: ${lastError}`);
}

// Try each API key until one works (streaming via callback) - with full key rotation
async function invokeCodebuffStream({ messages, cwd, onChunk, completionId, created }) {
  const apiKeys = getAllApiKeys();

  if (apiKeys.length === 0) {
    throw new Error("No CODEBUFF_API_KEY* found in environment");
  }

  // Pre-flight: validate keys belong to different accounts
  const accounts = await validateApiKeys(apiKeys);

  // Build ordered attempt plan: paid -> free -> free (always start fresh)
  const attempts = buildAttemptPlan(apiKeys, accounts);
  console.log(
    `[bridge] Streaming attempt plan (${attempts.length} attempts): ${attempts.map((a) => a.label).join(" → ")}`,
  );

  const prompt = buildPrompt(messages);
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Timeout after ${TIMEOUT_MS}ms`)), TIMEOUT_MS);
  });

  let lastError = null;

  // Try each attempt in order
  for (let i = 0; i < attempts.length; i++) {
    const attempt = attempts[i];
    console.log(`[bridge] Streaming attempt ${i + 1}/${attempts.length}: ${attempt.label}...`);

    // Delay between attempts (except first)
    if (i > 0) {
      console.log(`[bridge] Waiting ${INTER_KEY_DELAY_MS / 1000}s before next attempt...`);
      await sleep(INTER_KEY_DELAY_MS);
    }

    try {
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
          // Track and log tool usage
          if (event && event.type === 'tool-call') {
            const toolName = event.toolName || event.name || 'unknown';
            if (!toolsUsed.has(toolName)) {
              toolsUsed.add(toolName);
              console.log(`[bridge] 🔧 Tool used: ${toolName}`);
            }
          }
          // Log agent reasoning
          if (event && event.type === 'reasoning') {
            const preview = event.content?.slice(0, 80) || '';
            console.log(`[bridge] 🤔 Reasoning: ${preview}...`);
          }
          // Stream any output events as they come in
          if (event && event.type === "output" && event.content) {
            fullText += event.content;
            // Send as streaming chunk
            const chunk = {
              id: completionId,
              object: "chat.completion.chunk",
              created,
              model: MODEL_ID,
              choices: [
                {
                  index: 0,
                  delta: { content: event.content },
                  finish_reason: null,
                },
              ],
            };
            onChunk(chunk);
          }
        },
        maxAgentSteps: 50,
      };

      // Apply cost mode (paid or free)
      if (attempt.costMode) {
        runOpts.costMode = attempt.costMode;
      }

      const result = await suppressSDKErrors(() => Promise.race([client.run(runOpts), timeoutPromise]))();

      const output = result.output || "";
      const resultStr = typeof output === "string" ? output : JSON.stringify(output);

      // Suppress SDK error dumps by catching them at the output level
      if (resultStr.includes("Symbol(vercel.ai.error)")) {
        const errorMatch = resultStr.match(/"message":"([^"]+)"/);
        const cleanError = errorMatch ? errorMatch[1] : "SDK error (output parsing failed)";
        throw new Error(cleanError);
      }

      // Check for rate limit in output (not just errors)
      if (isRateLimitError(resultStr)) {
        const resetMatch = resultStr.match(/(\d+)\s*(day|hour|minute)/);
        const resetInfo = resetMatch ? ` (resets in ${resetMatch[0]})` : "";
        lastError = resultStr.slice(0, 500);
        console.log(`[bridge] ⏸️  Rate limited on ${attempt.label}${resetInfo}`);
        continue;
      }
      if (isAuthError(resultStr)) {
        lastError = resultStr.slice(0, 500);
        console.warn(`[bridge] ❌ Auth failed on ${attempt.label}`);
        continue;
      }

      console.log(`[bridge] ✅ Success on ${attempt.label}`);

      // Success - send any remaining output
      if (typeof output === "string" && output.length > 0) {
        const remaining = typeof output === "string" ? output : JSON.stringify(output);
        if (remaining && remaining !== fullText) {
          const chunk = {
            id: completionId,
            object: "chat.completion.chunk",
            created,
            model: MODEL_ID,
            choices: [
              {
                index: 0,
                delta: { content: remaining.slice(fullText.length) },
                finish_reason: null,
              },
            ],
          };
          onChunk(chunk);
        }
      }

      // NOTE: Final chunk is sent by HTTP handler after we return continuation info
      // Log summary of tools used
      if (toolsUsed.size > 0) {
        console.log(`[bridge] 📊 Tools used: ${Array.from(toolsUsed).join(', ')}`);
      } else {
        console.log(`[bridge] 📊 Tools used: none (text-only mode)`);
      }

      // Parse response to detect continuation needs (same as non-streaming)
      const parseResult = parseAgentResponse(resultStr);

      return {
        text: fullText || resultStr,
        account: attempt.label,
        needsContinuation: parseResult.needsContinuation,
        hasSubgoals: parseResult.hasSubgoals,
      };
    } catch (err) {
      // Extract error details - suppress verbose SDK dumps
      const errStr = err.message || String(err);
      const errJson = err.responseBody ? JSON.parse(err.responseBody) : null;
      lastError = errStr;

      // Extract human-readable error message
      const cleanMessage = errJson?.message || errStr;

      if (isAuthError(errStr)) {
        console.warn(`[bridge] ❌ Auth failed on ${attempt.label}: ${cleanMessage.slice(0, 150)}`);
        continue;
      }

      if (isRateLimitError(errStr)) {
        // Extract reset time if available
        const resetMatch = cleanMessage.match(/(\d+)\s*(day|hour|minute)/);
        const resetInfo = resetMatch ? ` (resets in ${resetMatch[0]})` : "";
        console.log(`[bridge] ⏸️  Rate limited on ${attempt.label}${resetInfo}`);
        if (errJson?.message) {
          console.log(`[bridge]    Reason: ${errJson.message}`);
        }
        continue;
      }

      // Non-retryable error - log concisely and re-throw
      console.error(`[bridge] ❌ Fatal streaming error on ${attempt.label}: ${cleanMessage.slice(0, 200)}`);
      throw err;
    }
  }

  throw new Error(`All ${attempts.length} streaming attempts failed: ${lastError}`);
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
  return auth === `Bearer ${API_KEY}`;
}



// Main request handler
const server = http.createServer(async (req, res) => {
  // Debug: log ALL requests before any processing
  console.log(`[bridge] ===== REQUEST =====`);
  console.log(`[bridge] method: ${req.method}, url: ${req.url}`);
  console.log(`[bridge] headers: authorization=${req.headers.authorization?.slice(0,20)}...`);
  console.log(`[bridge] ===================`);

  try {
    // Auth check (skip for health check)
    if (req.url !== "/health" && !checkAuth(req)) {
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
      const apiKeys = getAllApiKeys();
      return sendJson(res, 200, {
        status: "ok",
        model: MODEL_ID,
        apiKeysConfigured: apiKeys.length > 0,
      });
    }

    // POST /v1/chat/completions or /chat/completions (OpenClaw might use either)
    if (req.method === "POST" && (req.url === "/v1/chat/completions" || req.url === "/chat/completions")) {
      const body = await parseBody(req);
      const model = body.model || MODEL_ID;
      const messages = Array.isArray(body.messages) ? body.messages : [];
      const stream = body.stream === true;

      // Extract issue context from user messages
      const userMessages = messages.filter(m => m.role === 'user');
      let issueContext = null;
      for (const msg of userMessages) {
        const content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
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

          // Determine finish_reason based on whether agent wants to continue
          let finishReason = "stop";
          if (streamResult?.needsContinuation) {
            finishReason = "length";  // Signal more work needed
            if (streamResult.hasSubgoals) {
              console.log(`[bridge] 🔄 More work needed: ${issueContext?.identifier || 'request'} (active subgoals)`);
            } else {
              console.log(`[bridge] 🔄 More work needed: ${issueContext?.identifier || 'request'} (pending work)`);
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
          finishReason = "length";  // Signal that agent wants to continue
          
          if (result.hasSubgoals) {
            console.log(`[bridge] 🔄 More work needed: ${issueContext?.identifier || 'request'} (active subgoals - continuation required)`);
          } else {
            console.log(`[bridge] 🔄 More work needed: ${issueContext?.identifier || 'request'} (pending tool calls)`);
          }
        } else {
          if (issueContext) {
            // Extract first line of summary for logging
            const summary = result.text || "";
            const firstLine = summary.split('\n')[0].trim().slice(0, 100) || '(no summary)';
            console.log(`[bridge] ✅ Finished: ${issueContext.identifier} — ${firstLine}`);
          }
        }

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
                content: result.text ?? "",
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

// Start server
server.listen(PORT, "127.0.0.1", async () => {
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
  
  // Validate keys on startup
  if (apiKeys.length > 0) {
    console.log(`[bridge] Validating API keys...`);
    const accounts = await validateApiKeys(apiKeys);
    if (accounts.length === 0) {
      console.warn(`[bridge] WARNING: No valid API keys found!`);
    }
  } else {
    console.warn(`[bridge] WARNING: No CODEBUFF_API_KEY* environment variables found!`);
  }
  
  console.log(`[bridge] ========================================`);
  console.log(`[bridge] Ready to accept requests`);
  console.log(`[bridge] ========================================`);
});

// Export for testing
export { invokeCodebuff, invokeCodebuffStream, getAllApiKeys, MODEL_ID };