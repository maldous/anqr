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
      const client = new CodebuffClient({
        apiKey: attempt.apiKey,
        cwd: cwd || DEFAULT_CWD,
      });

      const runOpts = {
        agent: MODEL_ID,
        prompt,
        handleEvent: () => {},
        maxAgentSteps: 50,
      };

      // Apply cost mode (paid or free)
      if (attempt.costMode) {
        runOpts.costMode = attempt.costMode;
      }

      const result = await Promise.race([client.run(runOpts), timeoutPromise]);

      const output = result.output;
      const resultStr = typeof output === "string" ? output : JSON.stringify(output);

      // Check for rate limit in output (not just errors)
      if (isRateLimitError(resultStr)) {
        lastError = resultStr.slice(0, 500);
        console.log(`[bridge] Rate limited on ${attempt.label}, trying next...`);
        continue;
      }
      if (isAuthError(resultStr)) {
        lastError = resultStr.slice(0, 500);
        console.warn(`[bridge] Auth error on ${attempt.label}, skipping.`);
        continue;
      }

      return {
        text: resultStr,
        account: attempt.label,
      };
    } catch (err) {
      const errStr = err.message || "";

      if (isAuthError(errStr)) {
        lastError = errStr;
        console.warn(`[bridge] Auth error on ${attempt.label}, skipping.`);
        continue;
      }

      if (isRateLimitError(errStr)) {
        lastError = errStr;
        console.log(`[bridge] ${errStr} on ${attempt.label}, trying next...`);
        continue;
      }

      // Non-retryable error - re-throw
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

      const client = new CodebuffClient({
        apiKey: attempt.apiKey,
        cwd: cwd || DEFAULT_CWD,
      });

      const runOpts = {
        agent: MODEL_ID,
        prompt,
        handleEvent: (event) => {
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

      const result = await Promise.race([client.run(runOpts), timeoutPromise]);

      const output = result.output || "";
      const resultStr = typeof output === "string" ? output : JSON.stringify(output);

      // Check for rate limit in output (not just errors)
      if (isRateLimitError(resultStr)) {
        lastError = resultStr.slice(0, 500);
        console.log(`[bridge] Rate limited on ${attempt.label}, trying next...`);
        continue;
      }
      if (isAuthError(resultStr)) {
        lastError = resultStr.slice(0, 500);
        console.warn(`[bridge] Auth error on ${attempt.label}, skipping.`);
        continue;
      }

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

      // Send final chunk with finish_reason
      const finalChunk = {
        id: completionId,
        object: "chat.completion.chunk",
        created,
        model: MODEL_ID,
        choices: [
          {
            index: 0,
            delta: {},
            finish_reason: "stop",
          },
        ],
      };
      onChunk(finalChunk);

      return {
        text: fullText || resultStr,
        account: attempt.label,
      };
    } catch (err) {
      const errStr = err.message || "";

      if (isAuthError(errStr)) {
        lastError = errStr;
        console.warn(`[bridge] Auth error on ${attempt.label}, skipping.`);
        continue;
      }

      if (isRateLimitError(errStr)) {
        lastError = errStr;
        console.log(`[bridge] ${errStr} on ${attempt.label}, trying next...`);
        continue;
      }

      // Non-retryable error - re-throw
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

        try {
          await invokeCodebuffStream({
            messages,
            cwd: DEFAULT_CWD,
            completionId,
            created,
            onChunk: (chunk) => {
              // Send immediately to client
              res.write(`data: ${JSON.stringify(chunk)}\n\n`);
            },
          });

          // Send [DONE] marker
          res.write("data: [DONE]\n\n");
          res.end();

          console.log(`[bridge] Streaming completed`);
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

        return sendJson(res, 200, {
          id: `chatcmpl-${Date.now()}`,
          object: "chat.completion",
          created: Math.floor(Date.now() / 1000),
          model,
          choices: [
            {
              index: 0,
              finish_reason: "stop",
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
    }

    // 404 for other routes
    sendJson(res, 404, { error: { message: "Not found" } });
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
server.listen(PORT, "127.0.0.1", () => {
  const apiKeys = getAllApiKeys();
  console.log(`Codebuff bridge listening on http://127.0.0.1:${PORT}/v1`);
  console.log(`  Model: ${MODEL_ID}`);
  console.log(`  API keys configured: ${apiKeys.length}`);
  console.log(`  Auth: Bearer ${API_KEY}`);
  console.log(`  Streaming: enabled`);
});

// Export for testing
export { invokeCodebuff, invokeCodebuffStream, getAllApiKeys, MODEL_ID };