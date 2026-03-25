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
 *   GET  /health               — Health check with provider status (no auth required)
 *   GET  /v1/metrics           — Bridge + credit-gate metrics
 *   GET  /v1/stats             — Provider statistics
 *   GET  /v1/providers         — Detailed provider status with probe results
 *   POST /v1/providers/refresh — Manually trigger provider re-probe
 */

import http from "node:http";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import { execSync } from "node:child_process";
import {
  selectProvider,
  recordProviderFailure,
  recordProviderFailureCount,
  recordProviderMetrics,
  recordProviderSuccess,
  getProviderStats,
  getRankedProviders,
  logProviderStats,
  clearProviderFailure,
  getConfiguredProviders,
  getProviderDefinitions,
  probeAllProviders,
} from "./symphony-credit-gate.mjs";

// AI SDK imports
import { generateText, streamText, tool, stepCountIs } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createGroq } from "@ai-sdk/groq";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { z } from "zod";

// Codebuff SDK — no longer imported directly; codebuff routes through codebuff-bridge (port 4318)
import { Codex } from "@openai/codex-sdk";

// Truncation utilities (extracted for unit-testability)
import { truncateMessagesForProvider } from "./symphony-bridge-truncation.mjs";

// --------------------------------------------------------------------------
// Console warning suppression
// --------------------------------------------------------------------------

/**
 * Suppress known harmless warnings from AI SDK/Codebuff runtime
 */
const originalWarn = console.warn;
console.warn = (...args) => {
  const warnStr = String(args[0] || "");
  // Suppress tools.profile allowlist warnings - these are SDK internal notices
  // about tools that are unavailable in current runtime/model config
  if (warnStr.includes("tools.profile") && warnStr.includes("allowlist contains unknown entries")) {
    return;
  }
  // Suppress agents.main.tools.allow warnings (same issue, different format)
  if (
    warnStr.includes("agents.main.tools.allow") &&
    warnStr.includes("allowlist contains unknown entries")
  ) {
    return;
  }
  originalWarn(...args);
};

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

function formatElapsed(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}min`;
}

function logMemory(label) {
  const mem = process.memoryUsage();
  const heapMB = Math.round(mem.heapUsed / 1024 / 1024);
  const rssMB = Math.round(mem.rss / 1024 / 1024);
  console.log(`[symphony-bridge] 💾 ${label}: heap=${heapMB}MB rss=${rssMB}MB`);
}

function ensureString(value) {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

// --------------------------------------------------------------------------
// Codex SDK invoke
// --------------------------------------------------------------------------

async function invokeWithCodex(provider, messages, options = {}) {
  const { stream = false, onChunk } = options;
  const codex = new Codex({
    env: process.env,
  });
  const thread = codex.startThread({
    model: provider.model || undefined,
    workingDirectory: process.cwd(),
    sandboxMode: "workspace-write",
    approvalPolicy: "never",
    webSearchEnabled: false,
    networkAccessEnabled: true,
  });

  const prompt = messages
    .map((message) => {
      const role = (message.role || "user").toUpperCase();
      const content =
        typeof message.content === "string" ? message.content : JSON.stringify(message.content);
      return `${role}:\n${content}`;
    })
    .join("\n\n");

  if (stream) {
    const streamed = await thread.runStreamed(prompt);
    let fullText = "";
    let usage = null;
    const emittedByItem = new Map();

    for await (const event of streamed.events) {
      if ((event.type === "item.updated" || event.type === "item.completed") && event.item) {
        if (event.item.type === "agent_message") {
          const prior = emittedByItem.get(event.item.id) || "";
          const next = event.item.text || "";
          const delta = next.startsWith(prior) ? next.slice(prior.length) : next;
          emittedByItem.set(event.item.id, next);
          if (delta && onChunk) {
            onChunk({ type: "text", text: delta });
          }
          fullText = next;
        }
      } else if (event.type === "turn.completed") {
        usage = event.usage;
      }
    }

    return {
      text: fullText,
      providerName: provider.name,
      usage: usage
        ? {
            promptTokens: usage.input_tokens + usage.cached_input_tokens,
            completionTokens: usage.output_tokens,
          }
        : undefined,
    };
  }

  const result = await thread.run(prompt);
  return {
    text: result.finalResponse || "",
    providerName: provider.name,
    usage: result.usage
      ? {
          promptTokens: result.usage.input_tokens + result.usage.cached_input_tokens,
          completionTokens: result.usage.output_tokens,
        }
      : undefined,
  };
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
    const hasOffset = typeof offset === "number";
    const hasLineCount = typeof lines === "number";

    // Handle offset and lines parameters
    if (hasOffset || hasLineCount) {
      const lineArray = content.split("\n");
      const startLine = hasOffset ? offset : 0;
      const endLine = hasLineCount ? startLine + lines : lineArray.length;
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
  exec: tool({
    description: "Execute a shell command and return the output",
    inputSchema: z.object({
      command: z.string().describe("Shell command to execute"),
      cwd: z.string().optional().describe("Working directory for the command"),
    }),
    execute: execTool,
  }),
  read: tool({
    description: "Read a file from the filesystem",
    inputSchema: z.object({
      path: z.string().describe("Path to the file to read"),
      offset: z.number().optional().describe("Line offset to start reading from"),
      lines: z.number().optional().describe("Number of lines to read"),
    }),
    execute: readFileTool,
  }),
  glob: tool({
    description: "Find files matching a glob pattern",
    inputSchema: z.object({
      pattern: z.string().describe("Glob pattern (e.g., '*.ts')"),
      cwd: z.string().optional().describe("Directory to search in"),
    }),
    execute: globTool,
  }),
};

// --------------------------------------------------------------------------
// Provider mapping
// --------------------------------------------------------------------------

/**
 * Map credit-gate providers to AI SDK instances.
 * "codebuff" routes through codebuff-bridge (port 4318) which handles paid→free fallback.
 */
const OPENROUTER_PROVIDER_NAME_SET = new Set([
  "openrouter-nemotron-super",
  "openrouter",
  "openrouter-free",
  "openrouter-nemotron-nano-30b",
  "openrouter-qwen3-next-80b",
  "openrouter-step3-5-flash",
  "openrouter-trinity-mini",
  "openrouter-nemotron-nano-9b",
  "openrouter-minimax-m2.5",
  "openrouter-qwen3-coder",
  "openrouter-lfm-2.5-thinking",
  "openrouter-lfm-2.5-instruct",
  "openrouter-nemotron-nano-12b-vl",
  "openrouter-trinity-large",
  "openrouter-mistral-small-3.1",
  "openrouter-llama-3.3-70b",
  "openrouter-qwen3-4b",
  "openrouter-gpt-oss-120b",
  "openrouter-gpt-oss-20b",
  "openrouter-llama-3.2-3b",
  "openrouter-dolphin-mistral",
  "openrouter-gemma-3-27b",
  "openrouter-glm-4.5-air",
  "openrouter-gemma-3n-e2b",
  "openrouter-gemma-3-4b",
  "openrouter-gemma-3n-e4b",
  "openrouter-gemma-3-12b",
  "openrouter-hermes-3-405b",
]);

function createOpenAiCompatibleModel(model, apiKey, baseURL, fallbackApiKey) {
  return createOpenAI({
    baseURL,
    apiKey: apiKey || fallbackApiKey,
    compatibility: "compatible",
    // .chat() forces /v1/chat/completions — required for non-OpenAI providers
    // (AI SDK v6 defaults to /v1/responses which third-party APIs don't support)
  }).chat(model);
}

function createProviderModel(provider) {
  const { name, model, baseUrl, apiKey } = provider;

  if (name === "codebuff") {
    return createOpenAiCompatibleModel(model, apiKey, "http://127.0.0.1:4318/v1", "local-bridge");
  }
  if (name === "groq") {
    return createGroq({ apiKey })(model);
  }
  if (name === "gemini" || name === "gemini-lite") {
    return createGoogleGenerativeAI({ apiKey })(model);
  }
  if (OPENROUTER_PROVIDER_NAME_SET.has(name)) {
    return createOpenRouter({ apiKey })(model);
  }
  if (name === "mistral") {
    return createOpenAiCompatibleModel(model, apiKey, "https://api.mistral.ai/v1");
  }
  if (name === "codex") {
    return createOpenAiCompatibleModel(model, apiKey, baseUrl || "https://api.openai.com/v1");
  }
  if (name === "sambanova") {
    return createOpenAiCompatibleModel(model, apiKey, baseUrl || "https://api.sambanova.ai/v1");
  }
  if (name === "cerebras") {
    return createOpenAiCompatibleModel(model, apiKey, baseUrl || "https://api.cerebras.ai/v1");
  }
  if (name === "github-models") {
    return createOpenAiCompatibleModel(
      model,
      apiKey,
      baseUrl || "https://models.github.ai/inference/v1",
    );
  }
  if (name === "ollama-local" || name.startsWith("ollama-qwen")) {
    return createOpenAiCompatibleModel(
      model,
      apiKey,
      baseUrl || "http://127.0.0.1:11434/v1",
      "ollama",
    );
  }
  if (!baseUrl) {
    throw new Error(`Provider ${name} not supported - no baseUrl for default fallback`);
  }
  return createOpenAiCompatibleModel(model, apiKey, baseUrl);
}

// --------------------------------------------------------------------------
// Bridge state
// --------------------------------------------------------------------------

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = process.env.SYMPHONY_BRIDGE_PORT || 4319;
const API_KEY = process.env.SYMPHONY_BRIDGE_API_KEY || "local-symphony";
const MODEL_ID = process.env.SYMPHONY_MODEL_ID || "symphony/main";
const BRIDGE_PROVIDER_BLOCKLIST = new Set();
const BRIDGE_PROVIDER_BLOCKLIST_REASONS = {};
const OPENROUTER_PROVIDER_NAMES = [
  "openrouter-nemotron-super",
  "openrouter-free",
  "openrouter-nemotron-nano-30b",
  "openrouter-qwen3-next-80b",
  "openrouter-step3-5-flash",
  "openrouter-trinity-mini",
  "openrouter-nemotron-nano-9b",
  "openrouter-minimax-m2.5",
  "openrouter-qwen3-coder",
  "openrouter-lfm-2.5-thinking",
  "openrouter-lfm-2.5-instruct",
  "openrouter-nemotron-nano-12b-vl",
  "openrouter-trinity-large",
  "openrouter-mistral-small-3.1",
  "openrouter-llama-3.3-70b",
  "openrouter-qwen3-4b",
  "openrouter-gpt-oss-120b",
  "openrouter-gpt-oss-20b",
  "openrouter-llama-3.2-3b",
  "openrouter-dolphin-mistral",
  "openrouter-gemma-3-27b",
  "openrouter-glm-4.5-air",
  "openrouter-gemma-3n-e2b",
  "openrouter-gemma-3-4b",
  "openrouter-gemma-3n-e4b",
  "openrouter-gemma-3-12b",
  "openrouter-hermes-3-405b",
];
const ADVERTISED_MODELS = [
  {
    id: "symphony/main",
    ownedBy: "symphony-bridge",
  },
  {
    id: "symphony/text",
    ownedBy: "symphony-bridge",
  },
  {
    id: "symphony/codex",
    ownedBy: "codex",
    allowedNames: ["codex"],
  },
  {
    id: "symphony/codebuff",
    ownedBy: "codebuff",
    allowedNames: ["codebuff"],
  },
  {
    id: "symphony/groq",
    ownedBy: "groq",
    allowedNames: ["groq"],
  },
  {
    id: "symphony/mistral",
    ownedBy: "mistral",
    allowedNames: ["mistral"],
  },
  {
    id: "symphony/gemini",
    ownedBy: "gemini",
    allowedNames: ["gemini"],
  },
  {
    id: "symphony/gemini-lite",
    ownedBy: "gemini-lite",
    allowedNames: ["gemini-lite"],
  },
  {
    id: "symphony/openrouter",
    ownedBy: "openrouter",
    allowedNames: OPENROUTER_PROVIDER_NAMES,
  },
  {
    id: "symphony/sambanova",
    ownedBy: "sambanova",
    allowedNames: ["sambanova"],
  },
  {
    id: "symphony/cerebras",
    ownedBy: "cerebras",
    allowedNames: ["cerebras"],
  },
  {
    id: "symphony/ollama-local",
    ownedBy: "ollama-local",
    allowedNames: ["ollama-qwen2.5-coder-3b", "ollama-qwen2.5-coder-0.5b"],
  },
  {
    id: "symphony/ollama-qwen2.5-coder-3b",
    ownedBy: "ollama-qwen2.5-coder-3b",
    allowedNames: ["ollama-qwen2.5-coder-3b"],
  },
  {
    id: "symphony/ollama-qwen2.5-coder-0.5b",
    ownedBy: "ollama-qwen2.5-coder-0.5b",
    allowedNames: ["ollama-qwen2.5-coder-0.5b"],
  },
];

// Accept multiple valid tokens - configured via env var or default
const additionalTokens = (process.env.SYMPHONY_BRIDGE_ACCEPTED_TOKENS || "")
  .split(",")
  .map((t) => t.trim())
  .filter(Boolean);

const VALID_TOKENS = new Set([API_KEY, ...additionalTokens]);

if (VALID_TOKENS.size > 1) {
  console.log(`[symphony-bridge] Auth: accepting ${VALID_TOKENS.size} tokens`);
}

const MAX_TOOL_ITERATIONS = 10000; // Maximum tool call loops for AI SDK providers
const REQUEST_TIMEOUT_MS = 30 * 60 * 1000; // 30 min — hard timeout per HTTP request (prevents infinite hangs)
const FALLBACK_DELAY_MS = 1000;
const MAX_RESPONSE_TEXT_BYTES = 512 * 1024; // 512KB cap on accumulated response text

// Opportunistic GC between requests (requires --expose-gc flag)
const maybeGC = typeof global.gc === "function" ? () => global.gc() : () => {};

// Periodic stats logging interval (every 10 requests)
const STATS_LOG_INTERVAL = 10;
let requestCount = 0;
let probeIntervalHandle = null;

// Provider exploration — re-discover providers whose rate-limit windows may have reset (5h matches Codex/Codebuff session limits)
const EXPLORATION_INTERVAL_MS = 5 * 60 * 60 * 1000; // 5h — matches Codex/Codebuff session limit windows
const EXPLORATION_MIN_PROBES = 3;
let lastExplorationTime = Date.now();
let explorationProbesThisPeriod = 0;
let lastSelectedProvider = null;

// ---------------------------------------------------------------------------
// Provider status cache — populated by startup probe, refreshed periodically
// ---------------------------------------------------------------------------

const PROVIDER_PROBE_INTERVAL_MS = 30 * 60 * 1000; // Re-probe every 30 minutes

const providerStatusCache = {
  configured: [],
  probeResults: [],
  lastProbeAt: null,
  probing: false,
};

async function refreshProviderStatus() {
  if (providerStatusCache.probing) return false;
  providerStatusCache.probing = true;

  try {
    const excludeNames = [...BRIDGE_PROVIDER_BLOCKLIST];
    providerStatusCache.configured = getConfiguredProviders({ excludeNames });
    providerStatusCache.probeResults = await probeAllProviders({ excludeNames });
    providerStatusCache.lastProbeAt = new Date().toISOString();

    const available = providerStatusCache.probeResults.filter((r) => r.available).length;
    const total = providerStatusCache.configured.length;
    console.log(`[symphony-bridge] 🔄 Provider status refreshed: ${available}/${total} available`);

    // Phase 2: probe tool-calling capability for all available providers
    await probeAllToolCapability();
  } catch (err) {
    console.error(`[symphony-bridge] Provider probe error: ${err.message}`);
  } finally {
    providerStatusCache.probing = false;
  }
}

function normalizeModelId(modelId) {
  if (!modelId) {
    return MODEL_ID;
  }
  if (modelId.startsWith("symphony-bridge/")) {
    return modelId.slice("symphony-bridge/".length);
  }
  if (modelId === "symphony/main@latest" || modelId === "main@latest" || modelId === "main") {
    return "symphony/main";
  }
  return modelId;
}

function resolveRoute(modelId) {
  const normalizedModelId = normalizeModelId(modelId);
  const advertised =
    ADVERTISED_MODELS.find((entry) => entry.id === normalizedModelId) ||
    ADVERTISED_MODELS.find((entry) => entry.id === MODEL_ID);

  const allowedNames = (advertised?.allowedNames || null)?.filter(
    (name) => !BRIDGE_PROVIDER_BLOCKLIST.has(name),
  );

  return {
    requestedModelId: modelId || MODEL_ID,
    normalizedModelId,
    responseModelId: advertised?.id || MODEL_ID,
    allowedNames,
  };
}

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
 * Safely convert any value to a descriptive error string.
 * Handles Error instances, plain objects (from AI SDK error events), and primitives.
 */
function errorToString(err) {
  if (err instanceof Error) return String(err);
  if (typeof err === "string") return err;
  if (err && typeof err === "object") {
    if (err.message) return `${err.type || err.name || "Error"}: ${err.message}`;
    try {
      return JSON.stringify(err).slice(0, 300);
    } catch {
      return "[unserializable error]";
    }
  }
  return String(err);
}

function isRetryableError(err) {
  const errStr = (typeof err === "string" ? err : errorToString(err)).toLowerCase();
  const isRetryable =
    errStr.includes("429") ||
    errStr.includes("402") ||
    errStr.includes("quota") ||
    errStr.includes("insufficient_quota") ||
    errStr.includes("usage limit") ||
    errStr.includes("rate_limit") ||
    errStr.includes("payment required") ||
    errStr.includes("out of credits") ||
    errStr.includes("insufficient credits") ||
    errStr.includes("free credits reset") ||
    errStr.includes("both modes failed") ||
    errStr.includes("both modes exhausted") ||
    errStr.includes("both paid and free") ||
    errStr.includes("codebuff provider exhausted") ||
    errStr.includes("codebuff provider failed") ||
    errStr.includes("codebuff continuation exhausted") ||
    errStr.includes("codebuff continuation failed") ||
    errStr.includes("provider exhausted") ||
    errStr.includes("triggering fallback") ||
    errStr.includes("timeout") ||
    errStr.includes("503") ||
    errStr.includes("502") ||
    errStr.includes("network") ||
    errStr.includes("econnrefused") ||
    errStr.includes("ECONNREFUSED") ||
    errStr.includes("econnreset") ||
    errStr.includes("ECONNRESET") ||
    errStr.includes("socket hang up") ||
    errStr.includes("premature close") ||
    errStr.includes("aborted") ||
    errStr.includes("fetch failed") ||
    errStr.includes("connection") ||
    errStr.includes("enotfound") ||
    errStr.includes("no output generated") ||
    errStr.includes("nooutputgeneratederror") || // cspell:disable-line
    errStr.includes("context_length_exceeded") ||
    errStr.includes("request too large") ||
    errStr.includes("reduce the length") ||
    errStr.includes("too many tokens") ||
    errStr.includes("failed_generation");

  // Log credit exhaustion errors for debugging
  if (
    isRetryable &&
    (errStr.includes("codebuff") || errStr.includes("credits") || errStr.includes("payment"))
  ) {
    console.log(
      `[symphony-bridge] 💳 Detected retryable credit/payment error: ${errStr.slice(0, 150)}`,
    );
  }

  // Log connection errors for debugging
  if (
    isRetryable &&
    (errStr.includes("econnrefused") ||
      errStr.includes("econnreset") ||
      errStr.includes("aborted") ||
      errStr.includes("socket"))
  ) {
    console.log(
      `[symphony-bridge] 🔌 Detected retryable connection error: ${errStr.slice(0, 150)}`,
    );
  }

  return isRetryable;
}

/**
 * Unwrap AI SDK error cause chains to find the root error.
 * AI SDK wraps errors: NoOutputGeneratedError → RetryError → APICallError.
 * Returns the deepest cause, or the original error if no cause chain exists.
 */
function unwrapAIError(err) {
  let current = err;
  let deepest = err;
  const seen = new Set();
  while (current?.cause && !seen.has(current.cause)) {
    seen.add(current.cause);
    current = current.cause;
    deepest = current;
  }
  return deepest;
}

/**
 * Check retry-ability by examining the full AI SDK error cause chain,  // cspell:disable-line
 * including responseBody and data properties from AI_APICallError.
 * Returns true if ANY error in the chain is retryable.
 */
function isRetryableErrorDeep(err) {
  if (isRetryableError(err)) return true;
  if (err?.responseBody && isRetryableError(err.responseBody)) return true;
  if (err?.data && isRetryableError(JSON.stringify(err.data))) return true;
  const root = unwrapAIError(err);
  if (root !== err) {
    if (isRetryableError(root)) return true;
    if (root?.responseBody && isRetryableError(root.responseBody)) return true;
    if (root?.data && isRetryableError(JSON.stringify(root.data))) return true;
  }
  return false;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildSelectionOptions(route, excludedNames = []) {
  return {
    allowedNames: route.allowedNames,
    excludeNames: [...excludedNames, ...nonToolCapableProviders],
  };
}

function toProviderMetricsUsage(usage = {}) {
  return {
    inputTokens: usage?.promptTokens || usage?.inputTokens || 0,
    outputTokens: usage?.completionTokens || usage?.outputTokens || 0,
  };
}

function recordSuccessfulMetrics(providerName, startedAt, usage, validationPassed = true) {
  const { inputTokens, outputTokens } = toProviderMetricsUsage(usage);
  recordProviderMetrics(providerName, {
    durationMs: Date.now() - startedAt,
    inputTokens,
    outputTokens,
    validationPassed,
  });
}

// Message truncation functions imported from ./symphony-bridge-truncation.mjs

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

// ---------------------------------------------------------------------------
// Dynamic tool-capability probing
//
// At startup, each available provider is tested with a minimal generateText
// call that includes a tool + toolChoice:'required'. Providers that return
// structured tool calls pass; those that emit raw JSON text or reject the
// tool_choice parameter are excluded from future credit-gate selection.
// A runtime safety net in invokeWithAI() catches any providers that slip
// through before the startup probe completes.
// ---------------------------------------------------------------------------

const KNOWN_TOOL_CAPABLE = new Set(["codex", "codebuff"]);
const toolCapableProviders = new Set(KNOWN_TOOL_CAPABLE);
const nonToolCapableProviders = new Set();
const TOOL_PROBE_TIMEOUT_MS = 20_000;
const TOOL_PROBE_BATCH_SIZE = 5;
const TOOL_PROBE_RETRY_DELAY_MS = 60_000;
let toolProbeRetryScheduled = false;
const RAW_TOOL_JSON_RE = /\{\s*"name"\s*:\s*"|"function_call"\s*:|"tool_calls"\s*:/;

function providerSupportsTools(providerName) {
  if (nonToolCapableProviders.has(providerName)) return false;
  if (toolCapableProviders.has(providerName)) return true;
  // Not yet probed — optimistically allow tools; runtime safety net catches failures
  return true;
}

async function probeToolCapabilityForProvider(providerDef) {
  const name = providerDef.name;

  if (KNOWN_TOOL_CAPABLE.has(name)) return { name, status: "known-capable" };
  if (toolCapableProviders.has(name)) return { name, status: "cached-capable" };
  if (nonToolCapableProviders.has(name)) return { name, status: "cached-non-capable" };

  // SDK-based providers are handled outside AI SDK tool protocol
  if (providerDef.requiresSdk || providerDef.driver === "codex-sdk") {
    toolCapableProviders.add(name);
    return { name, status: "sdk-capable" };
  }

  // OpenRouter: all models share the same API key and tool protocol support.
  // If any openrouter provider was already probed, reuse its result.
  if (OPENROUTER_PROVIDER_NAME_SET.has(name)) {
    for (const orName of OPENROUTER_PROVIDER_NAME_SET) {
      if (toolCapableProviders.has(orName)) {
        toolCapableProviders.add(name);
        return { name, status: "inferred-capable" };
      }
      if (nonToolCapableProviders.has(orName)) {
        nonToolCapableProviders.add(name);
        return { name, status: "inferred-non-capable" };
      }
    }
  }

  // Resolve API key (mirrors credit-gate's resolveProviderApiKey)
  let apiKey = providerDef.envVar ? process.env[providerDef.envVar] : null;
  if (!apiKey && providerDef.loadToken) {
    try {
      apiKey = await providerDef.loadToken();
    } catch {
      /* ignore */
    }
  }

  const providerObj = { ...providerDef, apiKey };
  let model;
  try {
    model = createProviderModel(providerObj);
  } catch {
    return { name, status: "no-model" };
  }
  if (!model) return { name, status: "no-model" };

  const probeTools = {
    add: tool({
      description: "Add two numbers",
      inputSchema: z.object({ a: z.number(), b: z.number() }),
      execute: async ({ a, b }) => String(a + b),
    }),
  };

  try {
    const result = await Promise.race([
      generateText({
        model,
        messages: [{ role: "user", content: "Compute 2+2. You must use the add tool." }],
        tools: probeTools,
        toolChoice: "auto",
        maxTokens: 100,
        maxSteps: 2,
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("tool-probe-timeout")), TOOL_PROBE_TIMEOUT_MS),
      ),
    ]);

    const hasStructuredToolCall = result.steps?.some((s) => s.toolCalls?.length > 0);
    const text = result.text || "";
    const hasRawToolJson = RAW_TOOL_JSON_RE.test(text);

    if (hasStructuredToolCall && !hasRawToolJson) {
      toolCapableProviders.add(name);
      return { name, status: "capable" };
    }

    if (hasRawToolJson) {
      nonToolCapableProviders.add(name);
      return { name, status: "non-capable-raw-json" };
    }

    // Model responded with text but didn't use the tool — inconclusive.
    // Don't exclude; the runtime safety net will catch it if needed.
    return { name, status: "no-tool-call" };
  } catch (err) {
    const errStr = String(err).slice(0, 300);

    // Rate limit — don't exclude; assume capable until proven otherwise
    if (/429|rate.?limit|too many|quota|resource.?exhausted/i.test(errStr)) {
      return { name, status: "rate-limited" };
    }

    // Explicit tool rejection by the API
    if (/tool_choice|tools.*not.*support|function.*call.*not|does not support/i.test(errStr)) {
      nonToolCapableProviders.add(name);
      return { name, status: "non-capable-rejected" };
    }

    if (/timeout|tool-probe-timeout/i.test(errStr)) {
      return { name, status: "timeout" };
    }

    // Log the actual error for debugging
    console.log(`[symphony-bridge] 🔧 ${name} probe error: ${errStr.slice(0, 150)}`);
    return { name, status: "probe-error" };
  }
}

async function probeAllToolCapability() {
  const available = (providerStatusCache.probeResults || [])
    .filter((r) => r.available)
    .map((r) => r.name);
  const availableSet = new Set(available);

  // Use full provider definitions (with envVar, baseUrl, loadToken) for probing
  const excludeNames = [...BRIDGE_PROVIDER_BLOCKLIST];
  const allDefs = getProviderDefinitions({ excludeNames });
  const toProbe = allDefs.filter(
    (p) =>
      availableSet.has(p.name) &&
      !KNOWN_TOOL_CAPABLE.has(p.name) &&
      !toolCapableProviders.has(p.name) &&
      !nonToolCapableProviders.has(p.name),
  );

  if (toProbe.length === 0) {
    console.log(`[symphony-bridge] 🔧 Tool probe: all providers already classified`);
    return;
  }

  console.log(`[symphony-bridge] 🔧 Tool capability probe: testing ${toProbe.length} providers...`);

  const results = [];
  for (let i = 0; i < toProbe.length; i += TOOL_PROBE_BATCH_SIZE) {
    if (i > 0) await sleep(1000); // throttle between batches to reduce rate-limit pressure
    const batch = toProbe.slice(i, i + TOOL_PROBE_BATCH_SIZE);
    const batchResults = await Promise.allSettled(
      batch.map((p) => probeToolCapabilityForProvider(p)),
    );
    for (const r of batchResults) {
      if (r.status === "fulfilled") {
        results.push(r.value);
      }
    }
  }

  for (const r of results) {
    const icon = toolCapableProviders.has(r.name)
      ? "✅"
      : nonToolCapableProviders.has(r.name)
        ? "🚫"
        : "❓";
    console.log(`[symphony-bridge]   ${icon} ${r.name}: ${r.status}`);
  }

  console.log(
    `[symphony-bridge] 🔧 Tool probe complete: ${toolCapableProviders.size} capable, ${nonToolCapableProviders.size} excluded`,
  );

  // Schedule a delayed retry for unclassified providers (rate-limited, probe-error, etc.)
  if (!toolProbeRetryScheduled) {
    const stillUnclassified = allDefs.filter(
      (p) =>
        availableSet.has(p.name) &&
        !toolCapableProviders.has(p.name) &&
        !nonToolCapableProviders.has(p.name),
    );
    if (stillUnclassified.length > 0) {
      toolProbeRetryScheduled = true;
      const names = stillUnclassified.map((p) => p.name);
      console.log(
        `[symphony-bridge] 🔧 Scheduling tool probe retry in ${TOOL_PROBE_RETRY_DELAY_MS / 1000}s for ${names.length} unclassified: ${names.join(", ")}`,
      );
      setTimeout(async () => {
        try {
          console.log(
            `[symphony-bridge] 🔧 Retry tool probe for ${names.length} unclassified providers...`,
          );
          await probeAllToolCapability();
          const remaining = names.filter(
            (n) => !toolCapableProviders.has(n) && !nonToolCapableProviders.has(n),
          );
          if (remaining.length > 0) {
            console.log(
              `[symphony-bridge] 🔧 Still unclassified after retry: ${remaining.join(", ")}`,
            );
          }
        } catch (err) {
          console.error(`[symphony-bridge] Tool probe retry failed: ${err.message}`);
        }
      }, TOOL_PROBE_RETRY_DELAY_MS);
    }
  }
}

/**
 * Invoke AI SDK with a provider, handling tool execution
 */
async function invokeWithAI(provider, messages, options = {}) {
  const { stream = false, onChunk } = options;

  if (provider.driver === "codex-sdk" || provider.name === "codex") {
    return invokeWithCodex(provider, messages, options);
  }

  // Create the provider model
  const model = createProviderModel(provider);

  if (!model) {
    throw new Error(`Provider ${provider.name} not supported with AI SDK`);
  }

  const useTools = providerSupportsTools(provider.name);
  console.log(
    `[symphony-bridge] Using AI SDK with provider: ${provider.name} (${provider.model})${useTools ? "" : " [no-tools]"}`,
  );

  // Convert messages to AI SDK format and truncate for provider's context limit
  const rawMessages = convertMessages(messages);
  const aiMessages = truncateMessagesForProvider(rawMessages, provider.name);

  // Validation: truncateMessagesForProvider guarantees at least one message,
  // but double-check to catch any edge cases
  if (!aiMessages || aiMessages.length === 0) {
    console.error(
      `[symphony-bridge] ❌ CRITICAL: Message truncation failed for provider ${provider.name}`,
    );
    console.error(`[symphony-bridge]   Original messages: ${messages?.length || 0}`);
    console.error(`[symphony-bridge]   Raw messages after conversion: ${rawMessages?.length || 0}`);
    console.error(
      `[symphony-bridge]   This should never happen - truncateMessagesForProvider has a fallback`,
    );
    throw new Error(
      `CRITICAL: Message truncation failed for provider ${provider.name} - original had ${messages?.length || 0} messages`,
    );
  }

  if (stream) {
    let finishReason = null;

    // Streaming with tool execution (tools disabled for providers that don't support them)
    const result = await streamText({
      model,
      messages: aiMessages,
      ...(useTools
        ? { tools, toolChoice: "auto", stopWhen: stepCountIs(MAX_TOOL_ITERATIONS) }
        : {}),
      onStepFinish: (step) => {
        if (step.toolCalls && step.toolCalls.length > 0) {
          for (const tc of step.toolCalls) {
            const input = tc.input ?? tc.args;
            const summary = input ? JSON.stringify(input).slice(0, 200) : "";
            console.log(`[symphony-bridge] 🔧 ${tc.toolName}: ${summary}`);
          }
        }
      },
      onFinish: (event) => {
        finishReason = event.finishReason;
        if (finishReason === "error" || !event.text) {
          console.log(
            `[symphony-bridge] ⚠️ Stream finished: reason=${finishReason}, text=${event.text?.length || 0} chars`,
          );
        }
        if (finishReason === "tool-calls") {
          console.log(
            `[symphony-bridge] ⚠️ Model hit step limit (${MAX_TOOL_ITERATIONS}) while still executing tools — response may be truncated`,
          );
        }
      },
    });

    // Process the full stream — includes reasoning, text, tool-call, and tool-result events
    let fullText = "";
    let fullTextCapped = false;
    let streamErrorDetail = null;
    let hasTextDeltas = false;

    for await (const part of result.fullStream) {
      // Track if we're receiving text-delta events (for fallback detection)
      if (part.type === "text-delta") {
        hasTextDeltas = true;
      }
      if (part.type === "reasoning-start") {
        if (onChunk) onChunk({ type: "text", text: "\n💡 " });
      } else if (part.type === "reasoning-delta") {
        if (onChunk && part.textDelta) {
          onChunk({ type: "text", text: part.textDelta });
        }
      } else if (part.type === "reasoning-end") {
        if (onChunk) onChunk({ type: "text", text: "\n" });
      } else if (part.type === "text-delta") {
        const delta = part.textDelta || "";
        if (!fullTextCapped) {
          if (fullText.length + delta.length > MAX_RESPONSE_TEXT_BYTES) {
            fullTextCapped = true;
            console.log(`[symphony-bridge] ⚠️ fullText capped at ${MAX_RESPONSE_TEXT_BYTES} bytes`);
          } else {
            fullText += delta;
          }
        }
        // Forward non-empty text deltas to client immediately (including Codebuff activity messages)
        if (onChunk && delta && delta.length > 0) {
          onChunk({ type: "text", text: delta });
        }
        // Log non-empty text-delta events for debugging (first 200 chars)
        if (delta && delta.length > 0) {
          console.log(`[symphony-bridge] 📨 text-delta (${delta.length} chars): ${delta.slice(0, 200)}`);
        }
      } else if (part.type === "tool-call") {
        const argsSummary = part.args ? JSON.stringify(part.args).slice(0, 200) : "";
        console.log(`[symphony-bridge] 🔧 ${part.toolName}: ${argsSummary}`);
        if (onChunk) {
          onChunk({ type: "text", text: `\n🔧 ${part.toolName}: \n` });
        }
      } else if (part.type === "tool-result") {
        console.log(`[symphony-bridge] ✅ ${part.toolName} done`);
        if (onChunk) {
          onChunk({ type: "text", text: `✅ ${part.toolName} done\n` });
        }
      } else if (part.type === "error") {
        const streamError = part.error || part;
        const rootError = unwrapAIError(streamError);
        const errorMsg = errorToString(rootError);
        streamErrorDetail = streamErrorDetail || errorMsg;
        // Log server-side only - internal provider errors are handled by auto-fallback
        console.log(`[symphony-bridge] 🔧 Internal provider error (auto-fallback will retry): ${errorMsg.slice(0, 150)}`);
        // DO NOT forward error events to client - these are internal Symphony routing errors
      } else if (part.type === "finish") {
        if (part.finishReason) {
          finishReason = part.finishReason;
        }
      }
    }

    // Fallback: if fullStream produced no text-delta events, try result.text
    // (best-effort — result.text derives from the same stream, but internal
    // accumulation may differ for some provider SDKs)
    //
    // For Codebuff: AI SDK buffers activity messages ("✅ done", "🔧 read:") and only
    // exposes them via result.text at the end. This is expected behavior - the AI SDK
    // only emits text-delta for model-generated text, not for SDK activity metadata.
    if (!hasTextDeltas || !fullText || fullText.trim() === "") {
      try {
        const fallbackText = await result.text;
        if (fallbackText && fallbackText.trim()) {
          if (!hasTextDeltas) {
            console.log(
              `[symphony-bridge] ⚠️ fullStream produced no text-delta events (${provider.name} buffered), recovered ${fallbackText.length} chars from result.text`,
            );
          }
          fullText = fallbackText;
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
      } catch (textErr) {
        // result.text can also throw AI_NoOutputGeneratedError — don't mask the original issue
        console.log(
          `[symphony-bridge] ⚠️ result.text fallback also failed: ${String(textErr).slice(0, 100)}`,
        );
      }
    }

    // Check for embedded errors — some providers return 200 with error in body
    if ((!fullText || fullText.trim() === "") && finishReason !== "tool-calls") {
      throw new Error(`Stream completed but produced no content (finishReason: ${finishReason})`);
    }
    if (finishReason === "error") {
      throw new Error(
        `Stream finished with error: ${streamErrorDetail || "unknown"} (text: ${fullText.length} chars)`,
      );
    }

    // Handle truncated responses — model hit step limit while still wanting to execute tools
    if (finishReason === "tool-calls") {
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
        throw new Error(`Response contains embedded error`);
      }
    }

    // Runtime safety net (streaming): detect providers that emit tool calls as raw JSON text.
    // The stream is already delivered, so we can't retry — just mark for future exclusion.
    if (useTools && fullText && RAW_TOOL_JSON_RE.test(fullText)) {
      console.log(
        `[symphony-bridge] ⚠️ ${provider.name} emitted tool calls as raw JSON text — marking as non-tool-capable for future requests`,
      );
      nonToolCapableProviders.add(provider.name);
    }

    console.log(`[symphony-bridge] Streaming completed (${fullText.length} chars)`);

    return {
      text: fullText,
      providerName: provider.name,
    };
  } else {
    // Non-streaming with tool execution (tools disabled for providers that don't support them)
    const result = await generateText({
      model,
      messages: aiMessages,
      ...(useTools
        ? { tools, toolChoice: "auto", stopWhen: stepCountIs(MAX_TOOL_ITERATIONS) }
        : {}),
    });

    let text = result.text || "";

    if (result.finishReason === "tool-calls") {
      console.log(
        `[symphony-bridge] ⚠️ Model hit step limit (${MAX_TOOL_ITERATIONS}) while still executing tools — response may be truncated`,
      );
      text +=
        "\n\n---\n⚠️ Response truncated: the model was still working when it reached the tool-execution step limit. The results above may be incomplete.";
    }

    // Runtime safety net (non-streaming): detect raw JSON tool output and cascade to next provider
    if (useTools && text && RAW_TOOL_JSON_RE.test(text)) {
      console.log(
        `[symphony-bridge] ⚠️ ${provider.name} emitted tool calls as raw JSON text — marking as non-tool-capable`,
      );
      nonToolCapableProviders.add(provider.name);
      throw new Error(
        `Provider ${provider.name} does not support structured tool calling — excluded`,
      );
    }

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
async function invokeWithFallback(messages, route) {
  const triedProviders = [];
  let lastError = null;
  let attemptNumber = 0;

  // Keep trying providers until we run out
  while (attemptNumber < 10) {
    attemptNumber++;

    // Get next provider from credit-gate (excluding already-tried ones)
    const provider = await selectProvider(buildSelectionOptions(route, triedProviders));

    if (!provider) {
      const excludedByProbe = (route.allowedNames || []).filter((n) =>
        nonToolCapableProviders.has(n),
      );
      const errorMsg =
        excludedByProbe.length > 0
          ? `No providers available for ${route.responseModelId} - ${excludedByProbe.join(", ")} excluded by tool-capability probe (non-tool-capable)`
          : lastError
            ? `All providers failed (tried ${triedProviders.join(", ")}). Last error: ${lastError}`
            : `No providers available for ${route.responseModelId} - check env vars and provider failures`;
      throw new Error(errorMsg);
    }

    // Check exploration
    const timeSinceLastExploration = Date.now() - lastExplorationTime;
    const needsExploration =
      timeSinceLastExploration > EXPLORATION_INTERVAL_MS ||
      explorationProbesThisPeriod < EXPLORATION_MIN_PROBES;

    if (needsExploration && lastSelectedProvider) {
      console.log(
        `[symphony-bridge] 🔍 Exploration mode: clearing failures to discover new providers`,
      );
      clearProviderFailure(lastSelectedProvider);
    }

    console.log(
      `[symphony-bridge] ${attemptNumber === 1 ? "Selected" : "Fallback"} provider (attempt ${attemptNumber}): ${provider.name} (${provider.model})`,
    );
    triedProviders.push(provider.name);

    // Track exploration
    if (provider.name !== lastSelectedProvider) {
      explorationProbesThisPeriod++;
      lastSelectedProvider = provider.name;
      if (timeSinceLastExploration > EXPLORATION_INTERVAL_MS) {
        lastExplorationTime = Date.now();
        explorationProbesThisPeriod = 1;
      }
    }

    if (attemptNumber > 1) {
      BRIDGE_METRICS.totalFallbacks++;
      await sleep(FALLBACK_DELAY_MS);
    }

    try {
      const startedAt = Date.now();
      const result = await invokeWithAI(provider, messages, { stream: false });

      console.log(`[symphony-bridge] ✅ Success with ${provider.name} (attempt ${attemptNumber})`);
      recordProviderSuccess(provider.name);
      recordSuccessfulMetrics(provider.name, startedAt, result.usage);

      requestCount++;
      if (requestCount % STATS_LOG_INTERVAL === 0) {
        logBridgeStats();
      }

      return {
        text: result.text,
        usage: result.usage,
        providerName: provider.name,
        attempts: attemptNumber,
        triedProviders: [...triedProviders],
      };
    } catch (err) {
      const errStr = String(err);
      lastError = errStr;
      console.log(
        `[symphony-bridge] ❌ ${provider.name} failed (attempt ${attemptNumber}): ${errStr.slice(0, 100)}`,
      );

      if (isRetryableErrorDeep(err)) {
        recordProviderFailure(provider.name);
        recordProviderFailureCount(provider.name);
      }

      // Continue to next provider in the loop
    }
  }

  // If we exhausted all attempts
  throw new Error(
    `All providers failed after ${attemptNumber} attempts (tried ${triedProviders.join(", ")}). Last error: ${lastError || "unknown"}`,
  );
}

/**
 * Transparent SSE relay for Codebuff - forwards raw SSE chunks directly to OpenClaw
 * without AI SDK buffering. This preserves real-time activity messages (✅ done, 🔧 read:, etc.)
 * that the AI SDK would otherwise buffer until the end.
 */
function invokeCodebuffDirectStream(messages, res) {
  return new Promise((resolve, reject) => {
    const requestBody = JSON.stringify({
      model: "codebuff/base",
      messages,
      stream: true,
    });

    console.log(`[symphony-bridge] 🌊 Transparent SSE relay: forwarding Codebuff stream directly (bypasses AI SDK)`);

    const options = {
      hostname: "127.0.0.1",
      port: 4318,
      path: "/v1/chat/completions",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(requestBody),
        "Authorization": "Bearer local-bridge",
      },
    };

    const proxyReq = http.request(options, (proxyRes) => {
      if (proxyRes.statusCode !== 200) {
        let errorBody = "";
        proxyRes.on("data", (chunk) => errorBody += chunk);
        proxyRes.on("end", () => {
          reject(new Error(`Codebuff bridge returned ${proxyRes.statusCode}: ${errorBody}`));
        });
        return;
      }

      let fullText = "";

      // Transparent relay - forward every SSE chunk from Codebuff directly to OpenClaw
      proxyRes.on("data", (chunk) => {
        const chunkStr = chunk.toString();
        
        // Forward chunk IMMEDIATELY to OpenClaw without parsing (transparent relay)
        res.write(chunk);
        
        // Extract content for logging and final result accumulation
        const lines = chunkStr.split("\n");
        for (const line of lines) {
          if (!line.trim() || line.startsWith(":")) continue;
          if (line === "data: [DONE]") continue;

          const dataMatch = line.match(/^data: (.+)$/);
          if (!dataMatch) continue;

          try {
            const parsed = JSON.parse(dataMatch[1]);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              console.log(`[symphony-bridge] 🌊 SSE relay (${content.length} chars): ${content.slice(0, 100)}`);
            }
          } catch {
            // Ignore parse errors - we already forwarded the raw chunk
          }
        }
      });

      proxyRes.on("end", () => {
        console.log(`[symphony-bridge] 🌊 Transparent relay complete: ${fullText.length} chars`);
        resolve({ text: fullText, providerName: "codebuff" });
      });

      proxyRes.on("error", (err) => {
        reject(new Error(`Codebuff stream error: ${err.message}`));
      });
    });

    proxyReq.on("error", (err) => {
      reject(new Error(`Codebuff request error: ${err.message}`));
    });

    proxyReq.write(requestBody);
    proxyReq.end();
  });
}

/**
 * Invoke with streaming and automatic fallback
 */
async function invokeWithFallbackStream(messages, route, onChunk) {
  const triedProviders = [];
  let lastError = null;
  let attemptNumber = 0;

  // Keep trying providers until we run out (higher limit for streaming due to rate limits)
  while (attemptNumber < 15) {
    attemptNumber++;

    // Get next provider from credit-gate (excluding already-tried ones)
    const provider = await selectProvider(buildSelectionOptions(route, triedProviders));

    if (!provider) {
      const excludedByProbe = (route.allowedNames || []).filter((n) =>
        nonToolCapableProviders.has(n),
      );
      const errorMsg =
        excludedByProbe.length > 0
          ? `No providers available for ${route.responseModelId} - ${excludedByProbe.join(", ")} excluded by tool-capability probe (non-tool-capable)`
          : lastError
            ? `All streaming providers failed (tried ${triedProviders.join(", ")}). Last error: ${lastError}`
            : `No providers available for ${route.responseModelId} - check env vars and provider failures`;
      throw new Error(errorMsg);
    }

    console.log(
      `[symphony-bridge] ${attemptNumber === 1 ? "Streaming selected" : "Streaming fallback"} provider (attempt ${attemptNumber}): ${provider.name} (${provider.model})`,
    );
    triedProviders.push(provider.name);

    if (attemptNumber > 1) {
      BRIDGE_METRICS.totalFallbacks++;
      await sleep(FALLBACK_DELAY_MS);
    }

    // Note: Codebuff transparent relay is handled in the main POST /v1/chat/completions handler
    // to enable direct SSE passthrough without going through invokeWithFallbackStream

    try {
      const startedAt = Date.now();
      const result = await invokeWithAI(provider, messages, { stream: true, onChunk });

      console.log(
        `[symphony-bridge] ✅ Streaming success with ${provider.name} (attempt ${attemptNumber})`,
      );
      recordProviderSuccess(provider.name);
      recordSuccessfulMetrics(provider.name, startedAt);

      requestCount++;
      if (requestCount % STATS_LOG_INTERVAL === 0) {
        logBridgeStats();
      }

      return {
        text: result.text,
        providerName: provider.name,
        attempts: attemptNumber,
        triedProviders: [...triedProviders],
      };
    } catch (err) {
      const rootErr = unwrapAIError(err);
      const errStr = errorToString(rootErr !== err ? rootErr : err);
      lastError = errStr;
      console.log(
        `[symphony-bridge] ❌ Streaming ${provider.name} failed (attempt ${attemptNumber}): ${errStr.slice(0, 200)}`,
      );

      if (isRetryableErrorDeep(err)) {
        recordProviderFailure(provider.name);
        recordProviderFailureCount(provider.name);
      }

      // Continue to next provider in the loop
    }
  }

  // If we exhausted all attempts
  throw new Error(
    `All streaming providers failed after ${attemptNumber} attempts (tried ${triedProviders.join(", ")}). Last error: ${lastError || "unknown"}`,
  );
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

function recordBridgeMetrics({
  provider,
  durationMs,
  isStream,
  tokensIn,
  tokensOut,
  toolCalls,
  isError,
  errorType,
}) {
  BRIDGE_METRICS.totalRequests++;
  if (isStream) {
    BRIDGE_METRICS.streamingRequests++;
  } else {
    BRIDGE_METRICS.nonStreamingRequests++;
  }

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

  BRIDGE_METRICS.totalTokensIn += tokensIn || 0;
  BRIDGE_METRICS.totalTokensOut += tokensOut || 0;
  BRIDGE_METRICS.totalToolCalls += toolCalls || 0;

  if (provider) {
    BRIDGE_METRICS.requestsByProvider[provider] =
      (BRIDGE_METRICS.requestsByProvider[provider] || 0) + 1;
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
  console.log(
    `[symphony-bridge]   Total: ${BRIDGE_METRICS.totalRequests} requests | ${BRIDGE_METRICS.streamingRequests} stream | ${BRIDGE_METRICS.nonStreamingRequests} non-stream`,
  );
  console.log(
    `[symphony-bridge]   Errors: ${BRIDGE_METRICS.totalErrors} | Fallbacks: ${BRIDGE_METRICS.totalFallbacks} | Tool calls: ${BRIDGE_METRICS.totalToolCalls}`,
  );
  console.log(
    `[symphony-bridge]   Latency: ${BRIDGE_METRICS.avgResponseTimeMs}ms avg | ${BRIDGE_METRICS.minResponseTimeMs}ms min | ${BRIDGE_METRICS.maxResponseTimeMs}ms max`,
  );
  console.log(
    `[symphony-bridge]   Tokens: ${BRIDGE_METRICS.totalTokensIn} in | ${BRIDGE_METRICS.totalTokensOut} out`,
  );

  const topProviders = Object.entries(BRIDGE_METRICS.requestsByProvider)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  if (topProviders.length > 0) {
    const providerStrings = topProviders.map(([k, v]) => k + ":" + v);
    console.log(`[symphony-bridge]   Top providers: ${providerStrings.join(", ")}`);
  }

  const topErrors = Object.entries(BRIDGE_METRICS.errorsByType)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  if (topErrors.length > 0) {
    const errorStrings = topErrors.map(([k, v]) => k + ":" + v);
    console.log(`[symphony-bridge]   Top errors: ${errorStrings.join(", ")}`);
  }

  BRIDGE_METRICS.lastStatsLog = now;
  logProviderStats({ excludeNames: nonToolCapableProviders });

  const elapsedHours = Math.round((Date.now() - lastExplorationTime) / 3600000);
  console.log(
    `[symphony-bridge] 🔍 Exploration: ${elapsedHours}h since last, ${explorationProbesThisPeriod} unique providers tried`,
  );
}

// -------------------------------------------------------------------------->
// Main request handler
// --------------------------------------------------------------------------<

const server = http.createServer(async (req, res) => {
  console.log(`[symphony-bridge] ===== REQUEST =====`);
  console.log(`[symphony-bridge] method: ${req.method}, url: ${req.url}`);

  try {
    const skipAuth =
      req.url === "/health" || req.url === "/v1/models" || req.url === "/v1/providers";
    if (!skipAuth && !checkAuth(req)) {
      console.log(`[symphony-bridge] Auth failed for ${req.method} ${req.url}`);
      return unauthorized(res);
    }

    // GET /v1/models
    if (req.method === "GET" && req.url === "/v1/models") {
      return sendJson(res, 200, {
        object: "list",
        data: ADVERTISED_MODELS.map((entry) => ({
          id: entry.id,
          object: "model",
          owned_by: entry.ownedBy,
          created: 1704067200,
        })),
      });
    }

    // GET /health
    if (req.method === "GET" && req.url === "/health") {
      const stats = getProviderStats();
      const statsCount = Object.keys(stats).length;
      const configuredCount = providerStatusCache.configured.length;
      const availableCount = providerStatusCache.probeResults.filter((r) => r.available).length;

      return sendJson(res, 200, {
        status: "ok",
        model: MODEL_ID,
        providersConfigured: configuredCount,
        providersAvailable: availableCount,
        providersWithStats: statsCount,
        rankedProviders: getRankedProviders({ excludeNames: nonToolCapableProviders })
          .slice(0, 5)
          .map((p) => ({ name: p.name, score: p.score })),
        configuredProviders: providerStatusCache.probeResults
          .filter((r) => r.status !== "excluded")
          .map((r) => ({ name: r.name, status: r.status, available: r.available })),
        toolProbe: {
          capable: [...toolCapableProviders].sort(),
          excluded: [...nonToolCapableProviders].sort(),
          unclassified: (providerStatusCache.probeResults || [])
            .filter((r) => r.available)
            .map((r) => r.name)
            .filter((n) => !toolCapableProviders.has(n) && !nonToolCapableProviders.has(n))
            .sort(),
          blocked: [...BRIDGE_PROVIDER_BLOCKLIST].map((name) => ({
            name,
            reason: BRIDGE_PROVIDER_BLOCKLIST_REASONS[name] || "blocklisted",
          })),
        },
        tools: Object.keys(tools),
        lastProbeAt: providerStatusCache.lastProbeAt,
      });
    }

    // GET /v1/metrics
    if (req.method === "GET" && req.url === "/v1/metrics") {
      return sendJson(res, 200, {
        bridge: {
          ...BRIDGE_METRICS,
          uptimeSeconds: Math.round((Date.now() - process.startTime) / 1000),
        },
        creditGate: getProviderStats(),
      });
    }

    // GET /v1/stats
    if (req.method === "GET" && req.url === "/v1/stats") {
      const stats = getProviderStats();
      const ranked = getRankedProviders({ excludeNames: nonToolCapableProviders });

      return sendJson(res, 200, { rankedProviders: ranked, providerStats: stats });
    }

    // GET /v1/providers — detailed provider status with probe results and stats
    if (req.method === "GET" && req.url === "/v1/providers") {
      const stats = getProviderStats();
      const ranked = getRankedProviders({ excludeNames: nonToolCapableProviders });
      const rankMap = new Map(ranked.map((r) => [r.name, r]));

      const providers = providerStatusCache.probeResults
        .filter((probe) => probe.status !== "excluded")
        .map((probe) => {
          const rank = rankMap.get(probe.name);
          const provStats = stats[probe.name];
          return {
            name: probe.name,
            model: probe.model,
            status: probe.status,
            available: probe.available,
            probeDurationMs: probe.durationMs,
            rank: rank?.rank || null,
            score: rank?.score || null,
            selections: provStats?.selections || 0,
            successes: provStats?.successes || 0,
            failures: provStats?.failures || 0,
            successRate: provStats?.successRate || "N/A",
            avgDurationMs: provStats?.avgDurationMs || null,
            lastSelected: provStats?.lastSelected || null,
            lastSuccess: provStats?.lastSuccess || null,
          };
        });

      return sendJson(res, 200, {
        configured: providerStatusCache.configured.length,
        available: providerStatusCache.probeResults.filter((r) => r.available).length,
        lastProbeAt: providerStatusCache.lastProbeAt,
        providers,
      });
    }

    // POST /v1/providers/refresh — manually trigger a provider re-probe
    if (req.method === "POST" && req.url === "/v1/providers/refresh") {
      const started = refreshProviderStatus().catch((err) => {
        console.error(`[symphony-bridge] Manual probe error: ${err.message}`);
      });
      const isNew = started !== false;
      return sendJson(res, 200, {
        status: isNew ? "refreshing" : "already_probing",
        message: isNew
          ? "Provider probe started. Check /v1/providers for results."
          : "A probe is already in progress. Check /v1/providers for current results.",
      });
    }

    // POST /v1/chat/completions
    if (req.method === "POST" && req.url === "/v1/chat/completions") {
      let body;
      try {
        body = await parseBody(req);
      } catch (parseErr) {
        console.warn(`[symphony-bridge] ⚠️ Request parse error: ${parseErr.message}`);
        return sendJson(res, 400, {
          error: {
            message: "Invalid request body: not valid JSON",
            type: "invalid_request_error",
          },
        });
      }

      const messages = Array.isArray(body.messages) ? body.messages : undefined;

      // Fast validation BEFORE route resolution - fail immediately on invalid input
      if (!messages || messages.length === 0) {
        console.warn(
          `[symphony-bridge] ⚠️ Empty messages array received - returning 400 immediately`,
        );
        return sendJson(res, 400, {
          error: {
            message: "Invalid request: messages array must not be empty",
            type: "invalid_request_error",
            param: "messages",
          },
        });
      }

      // Validate message structure
      for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        if (!msg.role) {
          return sendJson(res, 400, {
            error: {
              message: `Invalid request: message[${i}].role is required`,
              type: "invalid_request_error",
              param: `messages[${i}].role`,
            },
          });
        }
        if (msg.content === undefined) {
          return sendJson(res, 400, {
            error: {
              message: `Invalid request: message[${i}].content is required`,
              type: "invalid_request_error",
              param: `messages[${i}].content`,
            },
          });
        }
      }

      // Validate model if present
      if (body.model !== undefined && typeof body.model !== "string") {
        return sendJson(res, 400, {
          error: {
            message: "Invalid request: model must be a string",
            type: "invalid_request_error",
            param: "model",
          },
        });
      }

      // Validate stream if present
      if (body.stream !== undefined && typeof body.stream !== "boolean") {
        return sendJson(res, 400, {
          error: {
            message: "Invalid request: stream must be a boolean",
            type: "invalid_request_error",
            param: "stream",
          },
        });
      }

      // Existing warning for empty string model (if model present but empty)
      if (!body.model && body.model !== undefined) {
        console.warn(`[symphony-bridge] ⚠️ Empty model field - using default`);
      }

      const route = resolveRoute(body.model || MODEL_ID);
      const stream = body.stream === true;

      // Log message summary for debugging
      console.log(
        `[symphony-bridge] 📨 Request messages: ${messages.length} total (${messages.filter((m) => m.role === "system").length} system, ${messages.filter((m) => m.role === "user").length} user, ${messages.filter((m) => m.role === "assistant").length} assistant)`,
      );

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
        `[symphony-bridge] Chat completion: requestedModel=${route.requestedModelId}, routedModel=${route.responseModelId}, messages=${messages.length}, stream=${stream}`,
      );
      logMemory("request-start");

      const startTime = Date.now();

      // Progress logger — log elapsed time periodically during long requests
      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        console.log(
          `[symphony-bridge] ⏱️ Request in progress: ${formatElapsed(elapsed)} elapsed (model=${route.responseModelId}, stream=${stream})`,
        );
        logMemory("request-progress");
      }, 60_000); // Log every 60 seconds

      // Hard request timeout — prevents infinite hangs regardless of provider state
      const requestTimeoutHandle = setTimeout(() => {
        const elapsed = Date.now() - startTime;
        console.error(
          `[symphony-bridge] ⏱️ ❌ REQUEST TIMEOUT after ${formatElapsed(elapsed)} — force-closing response`,
        );
        logMemory("request-timeout");
        clearInterval(progressInterval);
        try {
          if (stream && !res.writableEnded) {
            const errorChunk = {
              id: `chatcmpl-timeout-${Date.now()}`,
              object: "chat.completion.chunk",
              created: Math.floor(Date.now() / 1000),
              model: route.responseModelId,
              choices: [
                {
                  index: 0,
                  delta: {
                    content: `\n[Error: Request timed out after ${formatElapsed(elapsed)}]`,
                  },
                  finish_reason: "stop",
                },
              ],
            };
            res.write(`data: ${JSON.stringify(errorChunk)}\n\n`);
            res.write("data: [DONE]\n\n");
            res.end();
          } else if (!res.writableEnded) {
            sendJson(res, 504, {
              error: {
                message: `Request timed out after ${formatElapsed(elapsed)}`,
                type: "timeout_error",
              },
            });
          }
        } catch (e) {
          console.error(`[symphony-bridge] Timeout cleanup error: ${e.message}`);
        }
      }, REQUEST_TIMEOUT_MS);

      if (stream) {
        // Disable request timeout for streaming — tool execution can take minutes
        req.setTimeout(0);
        res.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          "X-Accel-Buffering": "no",
        });

        // SSE heartbeat — keeps connection alive during long tool executions
        const heartbeat = setInterval(() => {
          try {
            res.write(":ping\n\n");
          } catch {
            /* connection closed */
          }
        }, 10000);

        const completionId = `chatcmpl-${Date.now()}`;
        const created = Math.floor(Date.now() / 1000);

        // Transparent SSE relay for Codebuff - bypasses AI SDK buffering entirely
        // This preserves real-time activity messages (✅ done, 🔧 read:, etc.)
        // Only use if Codebuff is in the allowed provider set for this route
        const codebuffAllowed = !route.allowedNames || route.allowedNames.includes("codebuff");
        const codebuffNotBlocked = !BRIDGE_PROVIDER_BLOCKLIST.has("codebuff") && !nonToolCapableProviders.has("codebuff");
        
        console.log(`[symphony-bridge] 🔍 Codebuff relay check: allowed=${codebuffAllowed}, notBlocked=${codebuffNotBlocked}, route=${route.normalizedModelId}`);
        
        if (codebuffAllowed && codebuffNotBlocked) {
          try {
            console.log(`[symphony-bridge] 🌊 Using transparent SSE relay for Codebuff (real-time streaming, bypasses AI SDK)`);
            const result = await invokeCodebuffDirectStream(messages, res);
            
            clearInterval(heartbeat);
            clearInterval(progressInterval);
            clearTimeout(requestTimeoutHandle);

            // Codebuff bridge already sends [DONE], but send it again to ensure completion
            res.write("data: [DONE]\n\n");
            res.end();

            if (issueContext) {
              console.log(
                `[symphony-bridge] ✅ Finished: ${issueContext.identifier} (provider: codebuff, ${result.text.length} chars)`,
              );
            }

            const durationMs = Date.now() - startTime;
            recordBridgeMetrics({
              provider: "codebuff",
              durationMs,
              isStream: true,
              isError: false,
            });
            recordProviderSuccess("codebuff");
            recordSuccessfulMetrics("codebuff", startTime);
            maybeGC();
            return;
          } catch (codebuffErr) {
            const errMsg = String(codebuffErr.message || codebuffErr).slice(0, 200);
            console.log(`[symphony-bridge] ⚠️ Codebuff transparent relay failed: ${errMsg}`);
            
            // Record failure and fall through to standard cascade
            if (isRetryableErrorDeep(codebuffErr)) {
              recordProviderFailure("codebuff");
              recordProviderFailureCount("codebuff");
            }
            console.log(`[symphony-bridge] 🔄 Falling back to standard provider cascade...`);
            // Fall through to standard fallback cascade with other providers
          }
        } else {
          console.log(`[symphony-bridge] ⚠️ Codebuff transparent relay skipped (not in route or blocked), using standard cascade`);
        }

        try {
          const result = await invokeWithFallbackStream(messages, route, (chunk) => {
            if (chunk.type === "text") {
              const chunkData = {
                id: completionId,
                object: "chat.completion.chunk",
                created,
                model: route.responseModelId,
                choices: [{ index: 0, delta: { content: chunk.text }, finish_reason: null }],
              };
              res.write(`data: ${JSON.stringify(chunkData)}\n\n`);
            }
          });

          clearInterval(heartbeat);
          clearInterval(progressInterval);
          clearTimeout(requestTimeoutHandle);

          // Send final chunk
          const finalChunk = {
            id: completionId,
            object: "chat.completion.chunk",
            created,
            model: route.responseModelId,
            choices: [{ index: 0, delta: {}, finish_reason: "stop" }],
          };
          res.write(`data: ${JSON.stringify(finalChunk)}\n\n`);
          res.write("data: [DONE]\n\n");
          res.end();

          if (issueContext) {
            console.log(
              `[symphony-bridge] ✅ Finished: ${issueContext.identifier} (provider: ${result.providerName})`,
            );
          }

          const durationMs = Date.now() - startTime;
          recordBridgeMetrics({
            provider: result.providerName,
            durationMs,
            isStream: true,
            isError: false,
          });
          maybeGC();
        } catch (streamError) {
          clearInterval(heartbeat);
          clearInterval(progressInterval);
          clearTimeout(requestTimeoutHandle);
          console.error(
            `[symphony-bridge] Streaming error after ${formatElapsed(Date.now() - startTime)}: ${streamError.message}`,
          );

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
            model: route.responseModelId,
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
        let result;
        try {
          result = await invokeWithFallback(messages, route);
        } finally {
          clearInterval(progressInterval);
          clearTimeout(requestTimeoutHandle);
        }

        if (issueContext) {
          const resultText = ensureString(result.text);
          const firstLine = resultText
            ? resultText.split("\n")[0].trim().slice(0, 100)
            : "(no content)";
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

        maybeGC();

        return sendJson(res, 200, {
          id: `chatcmpl-${Date.now()}`,
          object: "chat.completion",
          created: Math.floor(Date.now() / 1000),
          model: route.responseModelId,
          choices: [
            {
              index: 0,
              message: { role: "assistant", content: ensureString(result.text) },
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
    logMemory("request-error");
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
  if (probeIntervalHandle) {
    clearInterval(probeIntervalHandle);
    probeIntervalHandle = null;
  }
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

// Disable default 2-minute server timeout for long-running SSE streams
server.timeout = 0;
server.keepAliveTimeout = 0;

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

  // Synchronously populate configured providers (no network calls)
  const excludeNames = [...BRIDGE_PROVIDER_BLOCKLIST];
  providerStatusCache.configured = getConfiguredProviders({ excludeNames });
  console.log(
    `[symphony-bridge] Configured providers (${providerStatusCache.configured.length}): ${providerStatusCache.configured.map((p) => p.name).join(", ")}`,
  );
  if (BRIDGE_PROVIDER_BLOCKLIST.size > 0) {
    console.log(`[symphony-bridge] ⛔ Blocked providers (${BRIDGE_PROVIDER_BLOCKLIST.size}):`);
    for (const name of BRIDGE_PROVIDER_BLOCKLIST) {
      const reason = BRIDGE_PROVIDER_BLOCKLIST_REASONS[name] || "blocklisted";
      console.log(`[symphony-bridge]   ⛔ ${name}: ${reason}`);
    }
  }

  // Async startup probe — test all providers for live availability
  refreshProviderStatus()
    .then(() => {
      const available = providerStatusCache.probeResults.filter((r) => r.available);
      const total = providerStatusCache.configured.length;
      console.log(`[symphony-bridge] ========================================`);
      console.log(
        `[symphony-bridge] Startup probe complete: ${available.length}/${total} providers available`,
      );
      for (const p of providerStatusCache.probeResults.filter((r) => r.status !== "excluded")) {
        const icon = p.available ? "✅" : "❌";
        const dur = p.durationMs > 0 ? ` (${p.durationMs}ms)` : "";
        console.log(`[symphony-bridge]   ${icon} ${p.name}: ${p.status}${dur}`);
      }
      if (nonToolCapableProviders.size > 0) {
        console.log(
          `[symphony-bridge] 🚫 Non-tool-capable (excluded from selection): ${[...nonToolCapableProviders].join(", ")}`,
        );
      }
      const unclassified = available
        .map((r) => r.name)
        .filter((n) => !toolCapableProviders.has(n) && !nonToolCapableProviders.has(n));
      if (unclassified.length > 0) {
        console.log(
          `[symphony-bridge] ❓ Unclassified (${unclassified.length}, left in pool): ${unclassified.join(", ")}`,
        );
      }
      console.log(
        `[symphony-bridge] ✅ Tool-capable: ${toolCapableProviders.size} | 🚫 Excluded: ${nonToolCapableProviders.size} | ❓ Unclassified: ${unclassified.length} | ⛔ Blocked: ${BRIDGE_PROVIDER_BLOCKLIST.size}`,
      );
      console.log(`[symphony-bridge] ========================================`);
      console.log(`[symphony-bridge] Ready to accept requests`);
      console.log(`[symphony-bridge] ========================================`);
    })
    .catch((err) => {
      console.error(`[symphony-bridge] Startup probe failed: ${err.message}`);
      console.log(`[symphony-bridge] ========================================`);
      console.log(`[symphony-bridge] Ready to accept requests (probe incomplete)`);
      console.log(`[symphony-bridge] ========================================`);
    });

  // Periodic re-probe to keep provider status fresh
  probeIntervalHandle = setInterval(() => {
    refreshProviderStatus().catch((err) => {
      console.error(`[symphony-bridge] Periodic probe failed: ${err.message}`);
    });
  }, PROVIDER_PROBE_INTERVAL_MS);
});

// Export for testing
export { invokeWithFallback, invokeWithFallbackStream, MODEL_ID, tools };
