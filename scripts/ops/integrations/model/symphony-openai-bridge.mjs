#!/usr/bin/env node

/**
 * symphony-openai-bridge.mjs — OpenAI-compatible HTTP gateway for Symphony provider cascade
 *
 * Exposes symphony's credit-gate provider selection and auto-fallback as an
 * OpenAI-compatible API for OpenClaw integration.
 *
 * Features:
 *   - Automatic provider selection via symphony-credit-gate
 *   - Auto-fallback on rate limits, errors, or unavailability
 *   - Tracks provider failures (6-min cooldown after failure)
 *   - Dynamic ranking based on actual performance
 *
 * Usage:
 *   node symphony-openai-bridge.mjs [--port 4319]
 *
 * Environment:
 *   SYMPHONY_BRIDGE_PORT       — Port to listen on (default: 4319)
 *   SYMPHONY_BRIDGE_API_KEY    — Bearer token for auth (default: local-symphony)
 *   SYMPHONY_BRIDGE_ACCEPTED_TOKENS — Comma-separated list of accepted tokens
 *   SYMPHONY_MODEL_ID          — Model ID to advertise (default: symphony/main)
 *
 * Endpoints:
 *   GET  /v1/models            — List available models
 *   POST /v1/chat/completions  — Chat completion (streaming & non-streaming)
 *   GET  /health               — Health check (no auth required)
 *   GET  /v1/metrics           — Bridge + credit-gate metrics
 *   GET  /v1/stats             — Provider statistics
 */

import http from "node:http";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  selectProvider,
  recordProviderFailure,
  recordProviderSuccess,
  getProviderStats,
  getRankedProviders,
  logProviderStats,
} from "./symphony-credit-gate.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = process.env.SYMPHONY_BRIDGE_PORT || 4319;
const API_KEY = process.env.SYMPHONY_BRIDGE_API_KEY || "local-symphony";
const MODEL_ID = process.env.SYMPHONY_MODEL_ID || "symphony/main";

// Accept multiple valid tokens - configured via env var or default
// SYMPHONY_BRIDGE_ACCEPTED_TOKENS: comma-separated list of accepted tokens
const additionalTokens = (process.env.SYMPHONY_BRIDGE_ACCEPTED_TOKENS || "")
  .split(",")
  .map((t) => t.trim())
  .filter(Boolean);

const VALID_TOKENS = new Set([API_KEY, ...additionalTokens]);

if (VALID_TOKENS.size > 1) {
  console.log(`[symphony-bridge] Auth: accepting ${VALID_TOKENS.size} tokens`);
}

const TIMEOUT_MS = 12 * 60 * 1000; // 12 min timeout (to match codebuff-bridge's 10min wait)

// Delay between fallback attempts
const FALLBACK_DELAY_MS = 1000;

// Periodic stats logging interval (every 10 requests)
const STATS_LOG_INTERVAL = 10;
let requestCount = 0;

// --------------------------------------------------------------------------
// Provider cascade wrapper with auto-fallback
// --------------------------------------------------------------------------

/**
 * Build prompt from OpenAI-style messages
 */
/**
 * Check if error is a temporary failure worth retrying
 */
function isRetryableError(err) {
  const errStr = String(err).toLowerCase();
  return (
    errStr.includes("429") ||
    errStr.includes("rate_limit") ||
    errStr.includes("timeout") ||
    errStr.includes("503") ||
    errStr.includes("502") ||
    errStr.includes("network") ||
    errStr.includes("econnrefused") ||
    errStr.includes("ECONNREFUSED") ||
    errStr.includes("fetch failed") ||
    errStr.includes("connection") ||
    errStr.includes("enotfound")
  );
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Try a single provider with the given messages
 */
async function tryProvider(provider, messages) {
  const { name, model, baseUrl, apiKey, requiresSdk } = provider;

  // Handle SDK providers - redirect to HTTP bridge equivalents
  // Note: codebuff-bridge waits up to 10min for paid account before trying free
  let effectiveModel = model;
  let effectiveBaseUrl = baseUrl;
  let effectiveApiKey = apiKey;

  if (requiresSdk) {
    // Map SDK provider names to their HTTP bridge equivalents
    const SDK_TO_HTTP = {
      codebuff: {
        name: "codebuff-bridge",
        model: "codebuff/base",
        baseUrl: "http://127.0.0.1:4318/v1",
        apiKey: "local-bridge",
      },
    };

    const httpBridge = SDK_TO_HTTP[name];
    if (httpBridge) {
      console.log(
        `[symphony-bridge] SDK provider '${name}' redirected to HTTP bridge (may take up to 10min)`,
      );
      effectiveModel = httpBridge.model;
      effectiveBaseUrl = httpBridge.baseUrl;
      effectiveApiKey = httpBridge.apiKey;
    } else {
      throw new Error(`SDK provider '${name}' has no HTTP bridge available`);
    }
  }

  const url = `${effectiveBaseUrl}/chat/completions`;

  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${effectiveApiKey}`,
      },
      body: JSON.stringify({
        model: effectiveModel,
        messages: messages,
        stream: false,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error_) {
    console.log(`[symphony-bridge] Fetch exception: ${error_.message}, URL: ${url}`);
    throw new Error(`Fetch failed: ${fetchErr.message}`);
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(`${response.status} ${response.statusText}: ${errorText.slice(0, 200)}`);
  }

  const data = await response.json();

  // Check for rate limit in response
  if (data.error?.code === "rate_limit" || data.error?.type?.includes("rate_limit")) {
    throw new Error(`429 rate limit: ${data.error.message || "Rate limited"}`);
  }

  // Check for continuation signal from downstream (e.g., codebuff-bridge with active subgoals)
  const finishReason = data.choices?.[0]?.finish_reason;
  const needsContinuation = finishReason === "length";

  if (needsContinuation) {
    console.log(
      `[symphony-bridge] 🔄 Downstream signals continuation needed (finish_reason=length)`,
    );
  }

  return { data, providerName: name, needsContinuation };
}

/**
 * Invoke with automatic fallback through all providers
 */
async function invokeWithFallback(messages) {
  // Get provider from credit-gate (handles fallback logic internally)
  let provider = await selectProvider();

  if (!provider) {
    throw new Error("No providers available - check env vars and provider failures");
  }

  console.log(`[symphony-bridge] Selected provider: ${provider.name} (${provider.model})`);

  try {
    const result = await tryProvider(provider, messages);

    // Success - record and return
    console.log(`[symphony-bridge] ✅ Success with ${provider.name}`);
    recordProviderSuccess(provider.name);

    // Log periodic stats
    requestCount++;
    if (requestCount % STATS_LOG_INTERVAL === 0) {
      logBridgeStats();
    }

    return {
      ...result,
      providerName: provider.name,
      attempts: 1,
      triedProviders: [provider.name],
    };
  } catch (err) {
    const errStr = String(err);

    // Record failure so credit-gate knows to skip this provider next time
    console.log(`[symphony-bridge] ❌ ${provider.name} failed: ${errStr.slice(0, 100)}`);

    if (isRetryableError(err)) {
      recordProviderFailure(provider.name);
    }

    // Try one more time with a fresh provider selection
    // The credit-gate will skip the failed provider and pick the next best
    provider = await selectProvider();

    if (!provider) {
      throw new Error(`All providers failed. Last error: ${errStr}`);
    }

    console.log(`[symphony-bridge] Retrying with fallback: ${provider.name} (${provider.model})`);
    BRIDGE_METRICS.totalFallbacks++;
    await sleep(FALLBACK_DELAY_MS);

    try {
      const result = await tryProvider(provider, messages);
      console.log(`[symphony-bridge] ✅ Fallback success with ${provider.name}`);
      recordProviderSuccess(provider.name);

      // Log periodic stats
      requestCount++;
      if (requestCount % STATS_LOG_INTERVAL === 0) {
        logBridgeStats();
      }

      return {
        ...result,
        providerName: provider.name,
        attempts: 2,
        triedProviders: [provider.name],
      };
    } catch (error_) {
      const retryStr = String(error_);
      console.log(
        `[symphony-bridge] ❌ Fallback ${provider.name} also failed: ${retryStr.slice(0, 100)}`,
      );
      if (isRetryableError(retryErr)) {
        recordProviderFailure(provider.name);
      }
      throw new Error(`Provider ${provider.name} failed: ${retryStr}`);
    }
  }
}

/**
 * Invoke with streaming and automatic fallback
 */
async function invokeWithFallbackStream(messages, onChunk) {
  // Get provider from credit-gate (handles fallback logic internally)
  let provider = await selectProvider();

  if (!provider) {
    throw new Error("No providers available - check env vars and provider failures");
  }

  console.log(
    `[symphony-bridge] Streaming selected provider: ${provider.name} (${provider.model})`,
  );

  try {
    const { name, model, baseUrl, apiKey, requiresSdk } = provider;

    // For SDK providers, redirect to HTTP bridge equivalents
    let effectiveBaseUrl = baseUrl;
    let effectiveApiKey = apiKey;
    let effectiveModel = model;

    if (requiresSdk) {
      const SDK_TO_HTTP = {
        codebuff: {
          baseUrl: "http://127.0.0.1:4318/v1",
          apiKey: "local-bridge",
          model: "codebuff/base",
        },
      };
      const httpBridge = SDK_TO_HTTP[name];
      if (httpBridge) {
        console.log(`[symphony-bridge] Streaming: SDK '${name}' redirected to HTTP bridge`);
        effectiveBaseUrl = httpBridge.baseUrl;
        effectiveApiKey = httpBridge.apiKey;
        effectiveModel = httpBridge.model;
      }
    }

    const url = `${effectiveBaseUrl}/chat/completions`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${effectiveApiKey}`,
      },
      body: JSON.stringify({
        model: effectiveModel,
        messages: messages,
        stream: true,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      throw new Error(`${response.status} ${response.statusText}: ${errorText.slice(0, 200)}`);
    }

    // Handle streaming response
    if (!response.body) {
      throw new Error("No response body");
    }

    let fullText = "";
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (!line.trim() || !line.startsWith("data: ")) continue;

        const data = line.slice(6);
        if (data === "[DONE]") continue;

        try {
          const parsed = JSON.parse(data);
          if (parsed.choices?.[0]?.delta?.content) {
            fullText += parsed.choices[0].delta.content;
            onChunk(parsed);
          }
        } catch {
          // Skip non-parseable lines
        }
      }
    }

    console.log(`[symphony-bridge] ✅ Streaming success with ${provider.name}`);
    recordProviderSuccess(provider.name);

    // Log periodic stats
    requestCount++;
    if (requestCount % STATS_LOG_INTERVAL === 0) {
      logBridgeStats();
    }

    return {
      text: fullText,
      providerName: provider.name,
      attempts: 1,
      triedProviders: [provider.name],
    };
  } catch (err) {
    const errStr = String(err);

    console.log(`[symphony-bridge] ❌ Streaming ${provider.name} failed: ${errStr.slice(0, 100)}`);

    if (isRetryableError(err)) {
      recordProviderFailure(provider.name);
    }

    // Try fallback - up to 2 more attempts
    for (let retry = 0; retry < 2; retry++) {
      provider = await selectProvider();

      if (!provider) {
        throw new Error(`Streaming providers failed. Last error: ${errStr}`);
      }

      console.log(`[symphony-bridge] Streaming fallback (attempt ${retry + 2}): ${provider.name}`);
      BRIDGE_METRICS.totalFallbacks++;
      await sleep(FALLBACK_DELAY_MS);

      try {
        const { name, model, baseUrl, apiKey, requiresSdk } = provider;

        // For SDK providers, redirect to HTTP bridge equivalents
        let effBaseUrl = baseUrl;
        let effApiKey = apiKey;
        let effModel = model;

        if (requiresSdk) {
          const SDK_TO_HTTP = {
            codebuff: {
              baseUrl: "http://127.0.0.1:4318/v1",
              apiKey: "local-bridge",
              model: "codebuff/base",
            },
          };
          const httpBridge = SDK_TO_HTTP[name];
          if (httpBridge) {
            console.log(
              `[symphony-bridge] Streaming fallback: SDK '${name}' redirected to HTTP bridge`,
            );
            effBaseUrl = httpBridge.baseUrl;
            effApiKey = httpBridge.apiKey;
            effModel = httpBridge.model;
          }
        }

        const url = `${effBaseUrl}/chat/completions`;

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${effApiKey}`,
          },
          body: JSON.stringify({
            model: effModel,
            messages: messages,
            stream: true,
          }),
          signal: AbortSignal.timeout(TIMEOUT_MS),
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => "Unknown error");
          throw new Error(`${response.status} ${response.statusText}: ${errorText.slice(0, 200)}`);
        }

        if (!response.body) {
          throw new Error("No response body");
        }

        let fullText = "";
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (!line.trim() || !line.startsWith("data: ")) continue;

            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.choices?.[0]?.delta?.content) {
                fullText += parsed.choices[0].delta.content;
                onChunk(parsed);
              }
            } catch {
              // Skip non-parseable lines
            }
          }
        }

        console.log(`[symphony-bridge] ✅ Streaming fallback success with ${provider.name}`);
        recordProviderSuccess(provider.name);

        // Log periodic stats
        requestCount++;
        if (requestCount % STATS_LOG_INTERVAL === 0) {
          logBridgeStats();
        }

        return {
          text: fullText,
          providerName: provider.name,
          attempts: retry + 2,
          triedProviders: [provider.name],
        };
      } catch (retryErr) {
        const retryStr = String(error_);
        console.log(
          `[symphony-bridge] ❌ Streaming fallback ${provider.name} failed: ${retryStr.slice(0, 100)}`,
        );
        if (isRetryableError(retryErr)) {
          recordProviderFailure(provider.name);
        }
        // Continue to next retry
      }
    }

    throw new Error(`All streaming providers failed. Last error: ${errStr}`);
  }
}

// --------------------------------------------------------------------------
// HTTP utilities
// --------------------------------------------------------------------------

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
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  // Accept: valid tokens, tokens starting with "local-", or no token (for local OpenClaw integration)
  const isValid = VALID_TOKENS.has(token) || token.startsWith("local-") || token === "";
  console.log(`[symphony-bridge] Auth check: received token="${token}", valid=${isValid}`);
  return isValid;
}

// Bridge-specific metrics tracking
const BRIDGE_METRICS = {
  totalRequests: 0,
  streamingRequests: 0,
  nonStreamingRequests: 0,
  totalFallbacks: 0,
  totalErrors: 0,
  avgResponseTimeMs: 0,
  minResponseTimeMs: null,
  maxResponseTimeMs: null,
  totalTokensIn: 0,
  totalTokensOut: 0,
  requestsByProvider: {},
  errorsByType: {},
  lastStatsLog: Date.now(),
};

function recordBridgeMetrics({
  provider,
  durationMs,
  isStream,
  tokensIn,
  tokensOut,
  isError,
  errorType,
}) {
  BRIDGE_METRICS.totalRequests++;
  if (isStream) {
    BRIDGE_METRICS.streamingRequests++;
  } else {
    BRIDGE_METRICS.nonStreamingRequests++;
  }

  // Response time tracking
  BRIDGE_METRICS.totalResponseTimeMs = (BRIDGE_METRICS.totalResponseTimeMs || 0) + durationMs;
  BRIDGE_METRICS.avgResponseTimeMs = Math.round(
    BRIDGE_METRICS.totalResponseTimeMs / BRIDGE_METRICS.totalRequests,
  );
  BRIDGE_METRICS.minResponseTimeMs = BRIDGE_METRICS.minResponseTimeMs
    ? Math.min(BRIDGE_METRICS.minResponseTimeMs, durationMs)
    : durationMs;
  BRIDGE_METRICS.maxResponseTimeMs = BRIDGE_METRICS.maxResponseTimeMs
    ? Math.max(BRIDGE_METRICS.maxResponseTimeMs, durationMs)
    : durationMs;

  // Tokens
  BRIDGE_METRICS.totalTokensIn += tokensIn || 0;
  BRIDGE_METRICS.totalTokensOut += tokensOut || 0;

  // Provider tracking
  if (provider) {
    BRIDGE_METRICS.requestsByProvider[provider] =
      (BRIDGE_METRICS.requestsByProvider[provider] || 0) + 1;
  }

  // Errors
  if (isError && errorType) {
    BRIDGE_METRICS.totalErrors++;
    BRIDGE_METRICS.errorsByType[errorType] = (BRIDGE_METRICS.errorsByType[errorType] || 0) + 1;
  }
}

function logBridgeStats() {
  const now = Date.now();
  const elapsed = Math.round((now - BRIDGE_METRICS.lastStatsLog) / 1000);

  console.log(`[symphony-bridge] 📊 Bridge Stats (last ${elapsed}s):`);
  console.log(
    `[symphony-bridge]   Total: ${BRIDGE_METRICS.totalRequests} requests | ${BRIDGE_METRICS.streamingRequests} stream | ${BRIDGE_METRICS.nonStreamingRequests} non-stream`,
  );
  console.log(
    `[symphony-bridge]   Errors: ${BRIDGE_METRICS.totalErrors} | Fallbacks: ${BRIDGE_METRICS.totalFallbacks}`,
  );
  console.log(
    `[symphony-bridge]   Latency: ${BRIDGE_METRICS.avgResponseTimeMs}ms avg | ${BRIDGE_METRICS.minResponseTimeMs}ms min | ${BRIDGE_METRICS.maxResponseTimeMs}ms max`,
  );
  console.log(
    `[symphony-bridge]   Tokens: ${BRIDGE_METRICS.totalTokensIn} in | ${BRIDGE_METRICS.totalTokensOut} out`,
  );

  // Top providers
  const topProviders = Object.entries(BRIDGE_METRICS.requestsByProvider)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  if (topProviders.length > 0) {
    console.log(
      `[symphony-bridge]   Top providers: ${topProviders.map(([k, v]) => `${k}:${v}`).join(", ")}`,
    );
  }

  // Top errors
  const topErrors = Object.entries(BRIDGE_METRICS.errorsByType)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  if (topErrors.length > 0) {
    console.log(
      `[symphony-bridge]   Top errors: ${topErrors.map(([k, v]) => `${k}:${v}`).join(", ")}`,
    );
  }

  BRIDGE_METRICS.lastStatsLog = now;

  // Also log credit-gate stats
  logProviderStats();
}

// --------------------------------------------------------------------------
// Main request handler
// --------------------------------------------------------------------------

const server = http.createServer(async (req, res) => {
  console.log(`[symphony-bridge] ===== REQUEST =====`);
  console.log(`[symphony-bridge] method: ${req.method}, url: ${req.url}`);

  try {
    // Auth check (skip for health check and model list)
    const skipAuth = req.url === "/health" || req.url === "/v1/models";
    if (!skipAuth && !checkAuth(req)) {
      console.log(`[symphony-bridge] Auth failed for ${req.method} ${req.url}`);
      return unauthorized(res);
    }

    // GET /v1/models - Return model IDs matching OpenClaw's provider format
    if (req.method === "GET" && req.url === "/v1/models") {
      return sendJson(res, 200, {
        object: "list",
        data: [
          {
            id: "symphony-bridge/symphony/main",
            object: "model",
            owned_by: "symphony-bridge",
            created: 1704067200,
          },
        ],
      });
    }

    // GET /health (no auth required)
    if (req.method === "GET" && req.url === "/health") {
      const stats = getProviderStats();
      const providerCount = Object.keys(stats).length;

      return sendJson(res, 200, {
        status: "ok",
        model: MODEL_ID,
        providersConfigured: providerCount,
        rankedProviders: getRankedProviders()
          .slice(0, 5)
          .map((p) => ({
            name: p.name,
            score: p.score,
          })),
      });
    }

    // GET /v1/metrics - View bridge metrics
    if (req.method === "GET" && req.url === "/v1/metrics") {
      return sendJson(res, 200, {
        bridge: {
          ...BRIDGE_METRICS,
          uptimeSeconds: Math.round((Date.now() - process.startTime) / 1000),
        },
        creditGate: getProviderStats(),
      });
    }

    // GET /stats - View provider statistics (alias for /v1/metrics)
    if (req.method === "GET" && req.url === "/v1/stats") {
      const stats = getProviderStats();
      const ranked = getRankedProviders();

      return sendJson(res, 200, {
        rankedProviders: ranked,
        providerStats: stats,
      });
    }

    // POST /v1/chat/completions
    if (req.method === "POST" && req.url === "/v1/chat/completions") {
      const body = await parseBody(req);
      const model = body.model || MODEL_ID;
      const messages = Array.isArray(body.messages) ? body.messages : [];
      const stream = body.stream === true;

      // Extract issue context
      const userMessages = messages.filter((m) => m.role === "user");
      let issueContext = null;
      for (const msg of userMessages) {
        const content = typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content);
        const issueMatch = content.match(/##\s*Issue:\s*([A-Z]+-\d+)\s*[—-]\s*([^\n]+)/);
        if (issueMatch) {
          issueContext = { identifier: issueMatch[1], title: issueMatch[2].trim() };
          break;
        }
      }

      if (issueContext) {
        console.log(
          `[symphony-bridge] 🚀 Request: ${issueContext.identifier} — ${issueContext.title}`,
        );
      }

      console.log(
        `[symphony-bridge] Chat completion: model=${model}, messages=${messages.length}, stream=${stream}`,
      );

      const startTime = Date.now();

      if (stream) {
        res.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          "X-Accel-Buffering": "no",
        });

        const completionId = `chatcmpl-${Date.now()}`;
        const created = Math.floor(Date.now() / 1000);

        // Track if downstream signaled continuation needed
        let needsContinuation = false;

        try {
          const result = await invokeWithFallbackStream(messages, (chunk) => {
            // Check if this chunk contains finish_reason from downstream
            const chunkFinish = chunk.choices?.[0]?.finish_reason;
            if (chunkFinish === "length") {
              needsContinuation = true;
              console.log(`[symphony-bridge] 🔄 Streaming downstream signals continuation`);
            }
            res.write(`data: ${JSON.stringify(chunk)}\n\n`);
          });

          // Send final chunk - check if continuation was signaled
          const finalChunk = {
            id: completionId,
            object: "chat.completion.chunk",
            created,
            model,
            choices: [
              {
                index: 0,
                delta: {},
                finish_reason: needsContinuation ? "length" : "stop",
              },
            ],
          };
          if (needsContinuation) {
            console.log(
              `[symphony-bridge] 🔄 Forwarding continuation to caller (finish_reason=length)`,
            );
          }
          res.write(`data: ${JSON.stringify(finalChunk)}\n\n`);
          res.write("data: [DONE]\n\n");
          res.end();

          if (issueContext) {
            console.log(
              `[symphony-bridge] ✅ Finished: ${issueContext.identifier} (provider: ${result.providerName})`,
            );
          }

          // Record streaming metrics
          const durationMs = Date.now() - startTime;
          recordBridgeMetrics({
            provider: result.providerName,
            durationMs,
            isStream: true,
            tokensIn: messages.length * 50,
            tokensOut: result.text?.length ? Math.round(result.text.length / 4) : 0,
            isError: false,
          });
        } catch (streamError) {
          console.error(`[symphony-bridge] Streaming error: ${streamError.message}`);

          const durationMs = Date.now() - startTime;
          recordBridgeMetrics({
            provider: result?.providerName || "unknown",
            durationMs,
            isStream: true,
            isError: true,
            errorType: streamError.message?.slice(0, 50) || "unknown",
          });
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
        // Non-streaming
        const result = await invokeWithFallback(messages);

        if (issueContext) {
          const messageContent = result.data.choices?.[0]?.message?.content;
          const firstLine = messageContent
            ? messageContent.split("\n")[0].trim().slice(0, 100)
            : "(no content)";
          console.log(`[symphony-bridge] ✅ Finished: ${issueContext.identifier} — ${firstLine}`);
        }

        const durationMs = Date.now() - startTime;
        const tokensIn = result.data?.usage?.prompt_tokens || 0;
        const tokensOut = result.data?.usage?.completion_tokens || 0;

        recordBridgeMetrics({
          provider: result.providerName,
          durationMs,
          isStream: false,
          tokensIn,
          tokensOut,
          isError: false,
        });

        return sendJson(res, 200, {
          ...result.data,
          model,
          _symphony_provider: result.providerName,
          _symphony_attempts: result.attempts,
          _symphony_tried: result.triedProviders,
          _symphony_duration_ms: durationMs,
        });
      }
    } else {
      sendJson(res, 404, { error: { message: "Not found" } });
    }
  } catch (error) {
    console.error(`[symphony-bridge] Error: ${error.message}`);
    sendJson(res, 500, {
      error: {
        message: error instanceof Error ? error.message : String(error),
        type: "server_error",
      },
    });
  }
});

// --------------------------------------------------------------------------
// Graceful shutdown
// --------------------------------------------------------------------------

function shutdown(signal) {
  console.log(`\n[symphony-bridge] Received ${signal}, shutting down...`);
  logProviderStats();
  server.close(() => {
    console.log("[symphony-bridge] Server closed");
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// --------------------------------------------------------------------------
// Start server
// --------------------------------------------------------------------------

server.listen(PORT, "127.0.0.1", () => {
  console.log(`[symphony-bridge] ========================================`);
  console.log(`[symphony-bridge] Symphony OpenAI Bridge Starting`);
  console.log(`[symphony-bridge] ========================================`);
  console.log(`[symphony-bridge] Listening: http://127.0.0.1:${PORT}/v1`);
  console.log(`[symphony-bridge] Model: ${MODEL_ID}`);
  console.log(`[symphony-bridge] Auth token: Bearer ${API_KEY.slice(0, 10)}...`);
  console.log(`[symphony-bridge] Streaming: enabled`);
  console.log(`[symphony-bridge] Auto-fallback: enabled (credit-gate)`);
  console.log(`[symphony-bridge] ========================================`);
  console.log(`[symphony-bridge] Ready to accept requests`);
  console.log(`[symphony-bridge] ========================================`);
});

// Export for testing
export { invokeWithFallback, invokeWithFallbackStream, MODEL_ID };
