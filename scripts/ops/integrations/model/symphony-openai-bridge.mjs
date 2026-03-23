#!/usr/bin/env node

/**
 * symphony-openai-bridge.mjs — OpenAI-compatible HTTP gateway for Symphony provider cascade
 *
 * Uses AI SDK for provider communication and tool execution, with credit-gate
 * for provider selection and auto-fallback.
 *
 * Features:
 *   - AI SDK for all provider communication
 *   - Actual tool execution (read, exec, glob)
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
import fs from "node:fs";
import { execSync } from "node:child_process";
import {
  selectProvider,
  recordProviderFailure,
  recordProviderSuccess,
  getProviderStats,
  getRankedProviders,
  logProviderStats,
  clearProviderFailure,
} from "./symphony-credit-gate.mjs";

// AI SDK imports
import { createAI } from "ai";
import { openai } from "@ai-sdk/openai";
import { groq } from "@ai-sdk/groq";
import { google } from "@ai-sdk/google";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

// Local Codebuff SDK
import { CodebuffClient } from "@codebuff/sdk";



// --------------------------------------------------------------------------
// Codebuff invoke (special handling)
// --------------------------------------------------------------------------

/**
 * Invoke with Codebuff SDK directly (bypasses AI SDK)
 */
async function invokeWithCodebuff(provider, messages, options = {}) {
  const { stream = false, onChunk } = options;
  const { apiKey, model } = provider;
  
  console.log(`[symphony-bridge] Using Codebuff SDK directly`);
  
  const client = new CodebuffClient({
    apiKey,
    cwd: process.cwd(),
  });
  
  // Build prompt from messages - combine all user messages
  const userMessages = messages.filter(m => m.role === 'user');
  const systemMessages = messages.filter(m => m.role === 'system');
  
  let prompt = '';
  if (systemMessages.length > 0) {
    prompt += systemMessages.map(m => 
      typeof m.content === 'string' ? m.content : JSON.stringify(m.content)
    ).join('\n\n') + '\n\n';
  }
  prompt += userMessages.map(m => 
    typeof m.content === 'string' ? m.content : JSON.stringify(m.content)
  ).join('\n\n');
  
  if (stream) {
    // Codebuff doesn't support streaming, so we run and simulate
    const result = await client.run({
      agent: model || 'codebuff/base',
      prompt,
      maxAgentSteps: MAX_TOOL_ITERATIONS,
    });
    
    const text = result?.text || result?.output || '';
    
    // Yield text in chunks
    for (let i = 0; i < text.length; i += 50) {
      const chunk = text.slice(i, i + 50);
      onChunk({ type: 'text', text: chunk });
    }
    
    return {
      text,
      providerName: provider.name,
    };
  } else {
    const result = await client.run({
      agent: model || 'codebuff/base',
      prompt,
      maxAgentSteps: MAX_TOOL_ITERATIONS,
    });
    
    return {
      text: result?.text || result?.output || '',
      providerName: provider.name,
      usage: { promptTokens: 0, completionTokens: 0 },
    };
  }
}

// --------------------------------------------------------------------------
// Tool definitions
// --------------------------------------------------------------------------

/**
 * Execute a shell command and return the output
 */
async function execTool({ command, cwd }) {
  try {
    const result = execSync(command, {
      cwd: cwd || process.cwd(),
      encoding: "utf-8",
      timeout: 60000,
      maxBuffer: 10 * 1024 * 1024, // 10MB
    });
    return { output: result, exitCode: 0 };
  } catch (error) {
    return {
      output: error.stdout || error.message,
      exitCode: error.status || 1,
      error: error.message,
    };
  }
}

/**
 * Read a file from the filesystem
 */
async function readFileTool({ path: filePath, offset, lines }) {
  try {
    let content = fs.readFileSync(filePath, "utf-8");
    const totalLines = content.split("\n").length;
    
    // Handle offset and lines parameters
    if (offset !== undefined || lines !== undefined) {
      const lineArray = content.split("\n");
      const startLine = offset || 0;
      const endLine = lines !== undefined ? startLine + lines : lineArray.length;
      content = lineArray.slice(startLine, endLine).join("\n");
      
      return {
        content,
        totalLines,
        truncated: endLine < totalLines,
        range: { start: startLine, end: endLine },
      };
    }
    
    // If content is large, truncate it
    if (content.length > 100000) {
      return {
        content: content.slice(0, 100000) + "\n... (truncated)",
        totalLines,
        truncated: true,
      };
    }
    
    return { content, totalLines };
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * List files matching a pattern
 */
async function globTool({ pattern, cwd }) {
  try {
    const baseDir = cwd || process.cwd();
    // Simple glob implementation using find
    const command = `find "${baseDir}" -type f -name "${pattern}" 2>/dev/null | head -100`;
    const result = execSync(command, { encoding: "utf-8", timeout: 10000 });
    const files = result.split("\n").filter(Boolean);
    return { files, count: files.length };
  } catch (error) {
    return { error: error.message, files: [] };
  }
}

// Available tools for the AI SDK
const tools = {
  exec: {
    description: "Execute a shell command and return the output",
    parameters: {
      type: "object",
      properties: {
        command: { type: "string", description: "Shell command to execute" },
        cwd: { type: "string", description: "Working directory for the command" },
      },
      required: ["command"],
    },
    execute: execTool,
  },
  read: {
    description: "Read a file from the filesystem",
    parameters: {
      type: "object",
      properties: {
        path: { type: "string", description: "Path to the file to read" },
        offset: { type: "number", description: "Line offset to start reading from" },
        lines: { type: "number", description: "Number of lines to read" },
      },
      required: ["path"],
    },
    execute: readFileTool,
  },
  glob: {
    description: "Find files matching a glob pattern",
    parameters: {
      type: "object",
      properties: {
        pattern: { type: "string", description: "Glob pattern (e.g., '*.ts')" },
        cwd: { type: "string", description: "Directory to search in" },
      },
      required: ["pattern"],
    },
    execute: globTool,
  },
};

// --------------------------------------------------------------------------
// Provider mapping
// --------------------------------------------------------------------------

/**
 * Map credit-gate providers to AI SDK instances
 * Returns null for providers that need special handling (like codebuff)
 */
function createProviderModel(provider) {
  const { name, model, baseUrl, apiKey } = provider;
  
  // Create the appropriate AI SDK model based on provider
  switch (name) {
    // Codebuff - handled separately in invokeWithAI
    case "codebuff":
      return null; // Special case - use CodebuffClient directly
    
    // Groq
    case "groq":
      return groq(model);
    
    // Google Gemini
    case "gemini":
    case "gemini-lite":
      return google(model);
    
    // OpenRouter (multiple models via OpenRouter API)
    case "openrouter-nemotron-super":
    case "openrouter":
      const openrouter = createOpenRouter({ apiKey });
      return openrouter(model);
    
    // OpenClaw - local gateway
    case "openclaw":
      const openclaw = openai({
        baseURL: baseUrl,
        apiKey: apiKey || "local",
      });
      return openclaw(model);
    
    // Mistral - use OpenAI-compatible API
    case "mistral":
      const mistral = openai({
        baseURL: "https://api.mistral.ai/v1",
        apiKey,
      });
      return mistral(model);
    
    // Codex (OpenAI) - use OpenAI-compatible API
    case "codex":
      const codex = openai({
        baseURL: baseUrl || "https://api.openai.com/v1",
        apiKey,
      });
      return codex(model);
    
    // Default - try OpenAI-compatible
    default:
      const defaultProvider = openai({
        baseURL: baseUrl,
        apiKey,
      });
      return defaultProvider(model);
  }
}

// --------------------------------------------------------------------------
// Bridge state
// --------------------------------------------------------------------------

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = process.env.SYMPHONY_BRIDGE_PORT || 4319;
const API_KEY = process.env.SYMPHONY_BRIDGE_API_KEY || "local-symphony";
const MODEL_ID = process.env.SYMPHONY_MODEL_ID || "symphony/main";

// Accept multiple valid tokens - configured via env var or default
const additionalTokens = (process.env.SYMPHONY_BRIDGE_ACCEPTED_TOKENS || "")
  .split(",")
  .map((t) => t.trim())
  .filter(Boolean);

const VALID_TOKENS = new Set([API_KEY, ...additionalTokens]);

if (VALID_TOKENS.size > 1) {
  console.log(`[symphony-bridge] Auth: accepting ${VALID_TOKENS.size} tokens`);
}

const MAX_TOOL_ITERATIONS = 10; // Maximum tool call loops
const FALLBACK_DELAY_MS = 1000;

// Periodic stats logging interval (every 10 requests)
const STATS_LOG_INTERVAL = 10;
let requestCount = 0;

// Provider exploration - ensure all providers are tried at least once per day
const EXPLORATION_INTERVAL_MS = 24 * 60 * 60 * 1000;
const EXPLORATION_MIN_PROBES = 3;
let lastExplorationTime = Date.now();
let explorationProbesThisPeriod = 0;
let lastSelectedProvider = null;

// --------------------------------------------------------------------------
// Tool execution helper
// --------------------------------------------------------------------------

/**
 * Execute a tool call and return the result
 */


// --------------------------------------------------------------------------
// AI SDK invoke with tool execution
// --------------------------------------------------------------------------

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
 * Convert OpenAI-style messages to AI SDK format
 */
function convertMessages(messages) {
  return messages.map((msg) => {
    const converted = { role: msg.role };
    
    if (typeof msg.content === "string") {
      converted.content = msg.content;
    } else if (Array.isArray(msg.content)) {
      // Handle multi-part messages
      const parts = msg.content.map((part) => {
        if (part.type === "text") {
          return { type: "text", text: part.text };
        }
        // Handle other part types
        return part;
      });
      converted.content = parts;
    }
    
    return converted;
  });
}

/**
 * Invoke AI SDK with a provider, handling tool execution
 */
async function invokeWithAI(provider, messages, options = {}) {
  const { stream = false, onChunk } = options;
  
  // Handle codebuff specially - use SDK directly
  if (provider.name === "codebuff") {
    return invokeWithCodebuff(provider, messages, options);
  }
  
  // Create the provider model
  const model = createProviderModel(provider);
  
  if (!model) {
    throw new Error(`Provider ${provider.name} not supported with AI SDK`);
  }
  
  console.log(`[symphony-bridge] Using AI SDK with provider: ${provider.name} (${provider.model})`);
  
  // Create AI instance with the model and tools
  const ai = createAI({
    model,
    tools,
  });
  
  // Convert messages to AI SDK format
  const aiMessages = convertMessages(messages);
  
  if (stream) {
    // Streaming with tool execution
    const result = await ai.streamText({
      messages: aiMessages,
      maxSteps: MAX_TOOL_ITERATIONS,
    });
    
    // Process the stream
    let fullText = "";
    
    for await (const chunk of result.textStream) {
      fullText += chunk;
      
      // Send chunk to callback
      if (onChunk) {
        onChunk({
          type: "text",
          text: chunk,
        });
      }
    }
    
    // Note: streamText handles tool execution automatically in maxSteps mode
    console.log(`[symphony-bridge] Streaming completed`);
    
    return {
      text: fullText,
      providerName: provider.name,
    };
  } else {
    // Non-streaming with tool execution
    const result = await ai.generateText({
      messages: aiMessages,
      maxSteps: MAX_TOOL_ITERATIONS,
    });
    
    const text = result.text || "";
    
    console.log(`[symphony-bridge] Completion done`);
    
    return {
      text,
      providerName: provider.name,
      usage: result.usage,
    };
  }
}

/**
 * Invoke with automatic fallback through all providers (non-streaming)
 */
async function invokeWithFallback(messages) {
  // Get provider from credit-gate
  let provider = await selectProvider();
  
  if (!provider) {
    throw new Error("No providers available - check env vars and provider failures");
  }
  
  // Check exploration
  const timeSinceLastExploration = Date.now() - lastExplorationTime;
  const needsExploration = timeSinceLastExploration > EXPLORATION_INTERVAL_MS || 
    explorationProbesThisPeriod < EXPLORATION_MIN_PROBES;
  
  if (needsExploration && lastSelectedProvider) {
    console.log(`[symphony-bridge] 🔍 Exploration mode: clearing failures to discover new providers`);
    clearProviderFailure(lastSelectedProvider);
  }
  
  console.log(`[symphony-bridge] Selected provider: ${provider.name} (${provider.model})`);
  
  // Track exploration
  if (provider.name !== lastSelectedProvider) {
    explorationProbesThisPeriod++;
    lastSelectedProvider = provider.name;
    if (timeSinceLastExploration > EXPLORATION_INTERVAL_MS) {
      lastExplorationTime = Date.now();
      explorationProbesThisPeriod = 1;
    }
  }
  
  try {
    const result = await invokeWithAI(provider, messages, { stream: false });
    
    console.log(`[symphony-bridge] ✅ Success with ${provider.name}`);
    recordProviderSuccess(provider.name);
    
    requestCount++;
    if (requestCount % STATS_LOG_INTERVAL === 0) {
      logBridgeStats();
    }
    
    return {
      text: result.text,
      usage: result.usage,
      providerName: provider.name,
      attempts: 1,
      triedProviders: [provider.name],
    };
  } catch (err) {
    const errStr = String(err);
    console.log(`[symphony-bridge] ❌ ${provider.name} failed: ${errStr.slice(0, 100)}`);
    
    if (isRetryableError(err)) {
      recordProviderFailure(provider.name);
    }
    
    // Try fallback
    provider = await selectProvider();
    
    if (!provider) {
      throw new Error(`All providers failed. Last error: ${errStr}`);
    }
    
    console.log(`[symphony-bridge] Retrying with fallback: ${provider.name}`);
    BRIDGE_METRICS.totalFallbacks++;
    await sleep(FALLBACK_DELAY_MS);
    
    try {
      const result = await invokeWithAI(provider, messages, { stream: false });
      console.log(`[symphony-bridge] ✅ Fallback success with ${provider.name}`);
      recordProviderSuccess(provider.name);
      
      requestCount++;
      if (requestCount % STATS_LOG_INTERVAL === 0) {
        logBridgeStats();
      }
      
      return {
        text: result.text,
        usage: result.usage,
        providerName: provider.name,
        attempts: 2,
        triedProviders: [provider.name],
      };
    } catch (error_) {
      const retryStr = String(error_);
      console.log(`[symphony-bridge] ❌ Fallback ${provider.name} also failed: ${retryStr.slice(0, 100)}`);
      if (isRetryableError(error_)) {
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
  let provider = await selectProvider();
  
  if (!provider) {
    throw new Error("No providers available - check env vars and provider failures");
  }
  
  console.log(`[symphony-bridge] Streaming selected provider: ${provider.name}`);
  
  try {
    const result = await invokeWithAI(provider, messages, { stream: true, onChunk });
    
    console.log(`[symphony-bridge] ✅ Streaming success with ${provider.name}`);
    recordProviderSuccess(provider.name);
    
    requestCount++;
    if (requestCount % STATS_LOG_INTERVAL === 0) {
      logBridgeStats();
    }
    
    return {
      text: result.text,
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
    
    // Try fallback
    for (let retry = 0; retry < 2; retry++) {
      provider = await selectProvider();
      
      if (!provider) {
        throw new Error(`Streaming providers failed. Last error: ${errStr}`);
      }
      
      console.log(`[symphony-bridge] Streaming fallback (attempt ${retry + 2}): ${provider.name}`);
      BRIDGE_METRICS.totalFallbacks++;
      await sleep(FALLBACK_DELAY_MS);
      
      try {
        const result = await invokeWithAI(provider, messages, { stream: true, onChunk });
        
        console.log(`[symphony-bridge] ✅ Streaming fallback success with ${provider.name}`);
        recordProviderSuccess(provider.name);
        
        requestCount++;
        if (requestCount % STATS_LOG_INTERVAL === 0) {
          logBridgeStats();
        }
        
        return {
          text: result.text,
          providerName: provider.name,
          attempts: retry + 2,
          triedProviders: [provider.name],
        };
      } catch (error_) {
        const retryStr = String(error_);
        console.log(`[symphony-bridge] ❌ Streaming fallback ${provider.name} failed: ${retryStr.slice(0, 100)}`);
        if (isRetryableError(error_)) {
          recordProviderFailure(provider.name);
        }
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
  const isValid = VALID_TOKENS.has(token) || token.startsWith("local-") || token === "";
  console.log(`[symphony-bridge] Auth check: received token="${token}", valid=${isValid}`);
  return isValid;
}

// --------------------------------------------------------------------------
// Metrics
// --------------------------------------------------------------------------

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
  totalToolCalls: 0,
  requestsByProvider: {},
  errorsByType: {},
  lastStatsLog: Date.now(),
};

function recordBridgeMetrics({ provider, durationMs, isStream, tokensIn, tokensOut, toolCalls, isError, errorType }) {
  BRIDGE_METRICS.totalRequests++;
  if (isStream) {
    BRIDGE_METRICS.streamingRequests++;
  } else {
    BRIDGE_METRICS.nonStreamingRequests++;
  }
  
  BRIDGE_METRICS.totalResponseTimeMs = (BRIDGE_METRICS.totalResponseTimeMs || 0) + durationMs;
  BRIDGE_METRICS.avgResponseTimeMs = Math.round(BRIDGE_METRICS.totalResponseTimeMs / BRIDGE_METRICS.totalRequests);
  BRIDGE_METRICS.minResponseTimeMs = BRIDGE_METRICS.minResponseTimeMs ? Math.min(BRIDGE_METRICS.minResponseTimeMs, durationMs) : durationMs;
  BRIDGE_METRICS.maxResponseTimeMs = BRIDGE_METRICS.maxResponseTimeMs ? Math.max(BRIDGE_METRICS.maxResponseTimeMs, durationMs) : durationMs;
  
  BRIDGE_METRICS.totalTokensIn += tokensIn || 0;
  BRIDGE_METRICS.totalTokensOut += tokensOut || 0;
  BRIDGE_METRICS.totalToolCalls += toolCalls || 0;
  
  if (provider) {
    BRIDGE_METRICS.requestsByProvider[provider] = (BRIDGE_METRICS.requestsByProvider[provider] || 0) + 1;
  }
  
  if (isError && errorType) {
    BRIDGE_METRICS.totalErrors++;
    BRIDGE_METRICS.errorsByType[errorType] = (BRIDGE_METRICS.errorsByType[errorType] || 0) + 1;
  }
}

function logBridgeStats() {
  const now = Date.now();
  const elapsed = Math.round((now - BRIDGE_METRICS.lastStatsLog) / 1000);
  
  console.log(`[symphony-bridge] 📊 Bridge Stats (last ${elapsed}s):`);
  console.log(`[symphony-bridge]   Total: ${BRIDGE_METRICS.totalRequests} requests | ${BRIDGE_METRICS.streamingRequests} stream | ${BRIDGE_METRICS.nonStreamingRequests} non-stream`);
  console.log(`[symphony-bridge]   Errors: ${BRIDGE_METRICS.totalErrors} | Fallbacks: ${BRIDGE_METRICS.totalFallbacks} | Tool calls: ${BRIDGE_METRICS.totalToolCalls}`);
  console.log(`[symphony-bridge]   Latency: ${BRIDGE_METRICS.avgResponseTimeMs}ms avg | ${BRIDGE_METRICS.minResponseTimeMs}ms min | ${BRIDGE_METRICS.maxResponseTimeMs}ms max`);
  console.log(`[symphony-bridge]   Tokens: ${BRIDGE_METRICS.totalTokensIn} in | ${BRIDGE_METRICS.totalTokensOut} out`);
  
  const topProviders = Object.entries(BRIDGE_METRICS.requestsByProvider).sort((a, b) => b[1] - a[1]).slice(0, 5);
  if (topProviders.length > 0) {
    console.log(`[symphony-bridge]   Top providers: ${topProviders.map(([k, v]) => `${k}:${v}`).join(", ")}`);
  }
  
  const topErrors = Object.entries(BRIDGE_METRICS.errorsByType).sort((a, b) => b[1] - a[1]).slice(0, 3);
  if (topErrors.length > 0) {
    console.log(`[symphony-bridge]   Top errors: ${topErrors.map(([k, v]) => `${k}:${v}`).join(", ")}`);
  }
  
  BRIDGE_METRICS.lastStatsLog = now;
  logProviderStats();
  
  const elapsedHours = Math.round((Date.now() - lastExplorationTime) / 3600000);
  console.log(`[symphony-bridge] 🔍 Exploration: ${elapsedHours}h since last, ${explorationProbesThisPeriod} unique providers tried`);
}

// -------------------------------------------------------------------------->
// Main request handler
// --------------------------------------------------------------------------<

const server = http.createServer(async (req, res) => {
  console.log(`[symphony-bridge] ===== REQUEST =====`);
  console.log(`[symphony-bridge] method: ${req.method}, url: ${req.url}`);
  
  try {
    const skipAuth = req.url === "/health" || req.url === "/v1/models";
    if (!skipAuth && !checkAuth(req)) {
      console.log(`[symphony-bridge] Auth failed for ${req.method} ${req.url}`);
      return unauthorized(res);
    }
    
    // GET /v1/models
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
    
    // GET /health
    if (req.method === "GET" && req.url === "/health") {
      const stats = getProviderStats();
      const providerCount = Object.keys(stats).length;
      
      return sendJson(res, 200, {
        status: "ok",
        model: MODEL_ID,
        providersConfigured: providerCount,
        rankedProviders: getRankedProviders().slice(0, 5).map((p) => ({ name: p.name, score: p.score })),
        tools: Object.keys(tools),
      });
    }
    
    // GET /v1/metrics
    if (req.method === "GET" && req.url === "/v1/metrics") {
      return sendJson(res, 200, {
        bridge: { ...BRIDGE_METRICS, uptimeSeconds: Math.round((Date.now() - process.startTime) / 1000) },
        creditGate: getProviderStats(),
      });
    }
    
    // GET /v1/stats
    if (req.method === "GET" && req.url === "/v1/stats") {
      const stats = getProviderStats();
      const ranked = getRankedProviders();
      
      return sendJson(res, 200, { rankedProviders: ranked, providerStats: stats });
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
        console.log(`[symphony-bridge] 🚀 Request: ${issueContext.identifier} — ${issueContext.title}`);
      }
      
      console.log(`[symphony-bridge] Chat completion: model=${model}, messages=${messages.length}, stream=${stream}`);
      
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
        
        try {
          const result = await invokeWithFallbackStream(messages, (chunk) => {
            if (chunk.type === "text") {
              const chunkData = {
                id: completionId,
                object: "chat.completion.chunk",
                created,
                model,
                choices: [{ index: 0, delta: { content: chunk.text }, finish_reason: null }],
              };
              res.write(`data: ${JSON.stringify(chunkData)}\n\n`);
            }
          });
          
          // Send final chunk
          const finalChunk = {
            id: completionId,
            object: "chat.completion.chunk",
            created,
            model,
            choices: [{ index: 0, delta: {}, finish_reason: "stop" }],
          };
          res.write(`data: ${JSON.stringify(finalChunk)}\n\n`);
          res.write("data: [DONE]\n\n");
          res.end();
          
          if (issueContext) {
            console.log(`[symphony-bridge] ✅ Finished: ${issueContext.identifier} (provider: ${result.providerName})`);
          }
          
          const durationMs = Date.now() - startTime;
          recordBridgeMetrics({
            provider: result.providerName,
            durationMs,
            isStream: true,
            isError: false,
          });
        } catch (streamError) {
          console.error(`[symphony-bridge] Streaming error: ${streamError.message}`);
          
          const durationMs = Date.now() - startTime;
          recordBridgeMetrics({
            provider: "unknown",
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
            choices: [{ index: 0, delta: { content: `\n[Error: ${streamError.message}]` }, finish_reason: "stop" }],
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
          const firstLine = result.text ? result.text.split("\n")[0].trim().slice(0, 100) : "(no content)";
          console.log(`[symphony-bridge] ✅ Finished: ${issueContext.identifier} — ${firstLine}`);
        }
        
        const durationMs = Date.now() - startTime;
        const tokensIn = result.usage?.promptTokens || 0;
        const tokensOut = result.usage?.completionTokens || 0;
        
        recordBridgeMetrics({
          provider: result.providerName,
          durationMs,
          isStream: false,
          tokensIn,
          tokensOut,
          isError: false,
        });
        
        return sendJson(res, 200, {
          id: `chatcmpl-${Date.now()}`,
          object: "chat.completion",
          created: Math.floor(Date.now() / 1000),
          model,
          choices: [
            {
              index: 0,
              message: { role: "assistant", content: result.text },
              finish_reason: "stop",
            },
          ],
          usage: {
            prompt_tokens: tokensIn,
            completion_tokens: tokensOut,
            total_tokens: tokensIn + tokensOut,
          },
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

// -------------------------------------------------------------------------->
// Graceful shutdown
// --------------------------------------------------------------------------<

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

// -------------------------------------------------------------------------->
// Start server
// --------------------------------------------------------------------------<

server.listen(PORT, "127.0.0.1", () => {
  console.log(`[symphony-bridge] ========================================`);
  console.log(`[symphony-bridge] Symphony OpenAI Bridge Starting`);
  console.log(`[symphony-bridge] ========================================`);
  console.log(`[symphony-bridge] Listening: http://127.0.0.1:${PORT}/v1`);
  console.log(`[symphony-bridge] Model: ${MODEL_ID}`);
  console.log(`[symphony-bridge] Auth token: Bearer ${API_KEY.slice(0, 10)}...`);
  console.log(`[symphony-bridge] Streaming: enabled`);
  console.log(`[symphony-bridge] Auto-fallback: enabled (credit-gate)`);
  console.log(`[symphony-bridge] Tools available: ${Object.keys(tools).join(", ")}`);
  console.log(`[symphony-bridge] ========================================`);
  console.log(`[symphony-bridge] Ready to accept requests`);
  console.log(`[symphony-bridge] ========================================`);
});

// Export for testing
export { invokeWithFallback, invokeWithFallbackStream, MODEL_ID, tools };