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
import { createLogger } from "../../lib/logger.mjs";

const { logDebug, logInfo, logWarn, logError } = createLogger();
import {
  selectProvider,
  recordProviderFailure,
  recordProviderFailureCount,
  recordProviderMetrics,
  recordProviderSuccess,
  getProviderStats,
  getRankedProviders,
  logProviderStats,
  getConfiguredProviders,
  getProviderDefinitions,
  probeAllProviders,
} from "./symphony-credit-gate.mjs";

// Session state and adaptive rotation
import {
  getSessionProvider,
  updateSessionProvider,
  clearSessionProvider,
  cleanupExpiredSessions,
  detectCodebuffMode,
  tuneAdaptiveParams,
  getProviderTurnLimit,
  shouldTriggerEvalCycle,
  getAdaptiveParams,
  getEvaluationSampleProvider,
} from "./symphony-session-state.mjs";

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

// Discord webhook notifications
import {
  streamDiscordUpdate,
  flushDiscordStream,
  sendDiscordEmbed,
} from "../notifications/discord-webhook.mjs";

// MEMORY.md updates for persistence across restarts
import { updateMemory } from "../../lib/update-memory.mjs";

// Discord message monitoring (listen for user input from Discord text channel)
let lastDiscordMessageId = null;
let discordMonitorInterval = null;

// Discord channel IDs
const DISCORD_TEXT_CHANNEL_ID = "1486262758256410646";

// Voice announcements removed - not possible to send spontaneous voice from Symphony bridge to Discord
// User will use Discord-based text-to-speech instead

/**
 * Poll Discord channel for new messages (user input)
 * Returns newest message if found, otherwise null
 */
async function pollDiscordMessages() {
  if (!process.env.DISCORD_WEBHOOK_URL) return null;

  try {
    // Extract webhook ID from URL
    const webhookMatch = process.env.DISCORD_WEBHOOK_URL.match(/webhooks\/(\d+)\//);
    if (!webhookMatch) return null;

    const channelId = DISCORD_TEXT_CHANNEL_ID;

    // Fetch recent messages from Discord API
    const response = await fetch(
      `https://discord.com/api/v10/channels/${channelId}/messages?limit=5`,
      {
        headers: {
          Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        },
      },
    );

    if (!response.ok) {
      logError(`Discord API error: ${response.status}`);
      return null;
    }

    const messages = await response.json();

    // Filter out bot messages (from webhook)
    const userMessages = messages.filter(
      (msg) =>
        !msg.webhook_id && // Not from webhook
        msg.author &&
        !msg.author.bot && // Not from bot
        (!lastDiscordMessageId || msg.id > lastDiscordMessageId), // Newer than last seen
    );

    if (userMessages.length > 0) {
      // Get the newest message
      const newest = userMessages[0];
      lastDiscordMessageId = newest.id;
      return {
        id: newest.id,
        content: newest.content,
        author: newest.author.username,
        timestamp: newest.timestamp,
      };
    }

    return null;
  } catch (err) {
    logError(`Discord poll error: ${err.message}`);
    return null;
  }
}

/**
 * Start monitoring Discord channel for user messages
 */
function startDiscordMonitoring() {
  if (!process.env.DISCORD_BOT_TOKEN) {
    logError(`⚠️ Discord monitoring disabled: DISCORD_BOT_TOKEN not set`);
    return;
  }

  if (discordMonitorInterval) {
    clearInterval(discordMonitorInterval);
  }

  logInfo(`📡 Starting Discord message monitoring (polling every 5s)`);

  discordMonitorInterval = setInterval(async () => {
    const message = await pollDiscordMessages();
    if (message) {
      logInfo(`📨 Discord command: "${message.content.slice(0, 100)}" (from ${message.author})`);

      // Process the command via Symphony bridge (Discord streaming handled by invokeCodebuffDirectStream)
      try {
        const response = await fetch("http://127.0.0.1:4319/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer local-symphony",
            "X-OpenClaw-Session": `discord:channel:${DISCORD_TEXT_CHANNEL_ID}`,
          },
          body: JSON.stringify({
            model: "symphony/main",
            messages: [{ role: "user", content: message.content }],
            stream: true,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          logError(`❌ Discord command failed: ${response.status} ${errorText.slice(0, 200)}`);
          return;
        }

        // Just consume the stream without duplicating to Discord
        // (Discord streaming is already handled by the main request handler via invokeCodebuffDirectStream)
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              const dataMatch = line.match(/^data: (.+)$/);
              if (!dataMatch || dataMatch[1] === "[DONE]") continue;

              try {
                const parsed = JSON.parse(dataMatch[1]);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  fullText += content;
                  // Discord streaming removed - already handled by invokeCodebuffDirectStream
                }
              } catch {
                // Parse error - ignore malformed JSON chunk
              }
            }
          }
        } finally {
          reader.releaseLock();
        }

        logInfo(`✅ Discord command processed: ${fullText.slice(0, 100)}`);
      } catch (err) {
        logError(`❌ Discord command error: ${err.message}`);
      }
    }
  }, 5000); // Poll every 5 seconds
}

/**
 * Stop monitoring Discord channel
 */
function stopDiscordMonitoring() {
  if (discordMonitorInterval) {
    clearInterval(discordMonitorInterval);
    discordMonitorInterval = null;
    logInfo(`📡 Stopped Discord message monitoring`);
  }
}

/**
 * Send periodic Processing Status embedded card to Discord
 * Shows all concurrent requests with runtime and file changes
 */
async function sendProcessingStatusUpdate() {
  if (activeRequests.size === 0) return;

  const now = Date.now();
  const fields = [];

  // Build fields for each active request
  for (const [reqId, req] of activeRequests.entries()) {
    const runtime = formatElapsed(now - req.startTime);
    const filesChanged = req.filesChanged || 0;
    const issueLabel = req.issueId || reqId;
    const requestPreview = req.requestText ? req.requestText.slice(0, 100) : "(no description)";

    fields.push({
      name: `${issueLabel} (${runtime})`,
      value: `Files: ${filesChanged} | ${requestPreview}`,
      inline: false,
    });
  }

  await sendDiscordEmbed({
    title: `⏳ Processing Status (${activeRequests.size} active)`,
    description: "Concurrent requests in progress",
    color: 0x3498db, // Blue
    fields,
  }).catch((err) => logDebug(`Processing status update failed: ${err.message}`));
}

/**
 * Start periodic processing status updates (once per minute)
 */
function startProcessingStatusUpdates() {
  if (processingStatusTimer) {
    clearInterval(processingStatusTimer);
  }

  logInfo(`📊 Starting periodic processing status updates (every 60s)`);

  processingStatusTimer = setInterval(async () => {
    await sendProcessingStatusUpdate();
  }, 60000); // Every 60 seconds
}

/**
 * Stop periodic processing status updates
 */
function stopProcessingStatusUpdates() {
  if (processingStatusTimer) {
    clearInterval(processingStatusTimer);
    processingStatusTimer = null;
    logInfo(`📊 Stopped periodic processing status updates`);
  }
}

// Voice announcements removed - OpenClaw automatically speaks my responses in Discord sessions
// Symphony bridge Discord notifications are text-only via webhook

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
  logDebug(`💾 ${label}: heap=${heapMB}MB rss=${rssMB}MB`);
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
 * Track file changes for the current request
 */
function trackFileChange(requestId) {
  const req = activeRequests.get(requestId);
  if (req) {
    req.filesChanged = (req.filesChanged || 0) + 1;
  }
}

/**
 * Get current request ID from async context (stored in global for tracking)
 */
let currentRequestId = null;
function setCurrentRequestId(id) {
  currentRequestId = id;
}
function getCurrentRequestId() {
  return currentRequestId;
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
 * Write a file (wrapper that tracks changes)
 */
async function writeFileTool({ path: filePath, content }) {
  try {
    fs.writeFileSync(filePath, content, "utf-8");

    // Track file change for current request
    const reqId = getCurrentRequestId();
    if (reqId) {
      trackFileChange(reqId);
    }

    return { success: true, path: filePath };
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

/**
 * Search memory files (MEMORY.md and knowledge files)
 */
async function memorySearchTool({ query }) {
  try {
    const memoryFile = path.join(process.cwd(), "MEMORY.md");
    const knowledgeFile = path.join(process.cwd(), "knowledge.md");
    const results = [];

    // Search MEMORY.md
    if (fs.existsSync(memoryFile)) {
      const content = fs.readFileSync(memoryFile, "utf-8");
      const lines = content.split("\n");
      const matches = lines
        .map((line, idx) => ({ line, idx }))
        .filter(({ line }) => line.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 10);

      if (matches.length > 0) {
        results.push({
          file: "MEMORY.md",
          matches: matches.map((m) => ({ line: m.line, lineNumber: m.idx + 1 })),
        });
      }
    }

    // Search knowledge.md
    if (fs.existsSync(knowledgeFile)) {
      const content = fs.readFileSync(knowledgeFile, "utf-8");
      const lines = content.split("\n");
      const matches = lines
        .map((line, idx) => ({ line, idx }))
        .filter(({ line }) => line.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 10);

      if (matches.length > 0) {
        results.push({
          file: "knowledge.md",
          matches: matches.map((m) => ({ line: m.line, lineNumber: m.idx + 1 })),
        });
      }
    }

    return { results, count: results.length };
  } catch (error) {
    return { error: error.message, results: [] };
  }
}

/**
 * Get full content of memory files
 */
async function memoryGetTool({ file }) {
  try {
    const validFiles = ["MEMORY.md", "knowledge.md", "CLAUDE.md"];
    const fileName = file || "MEMORY.md";

    if (!validFiles.includes(fileName)) {
      return { error: `Invalid file. Must be one of: ${validFiles.join(", ")}` };
    }

    const filePath = path.join(process.cwd(), fileName);

    if (!fs.existsSync(filePath)) {
      return { error: `File ${fileName} not found`, content: "" };
    }

    const content = fs.readFileSync(filePath, "utf-8");
    return { content, file: fileName, lines: content.split("\n").length };
  } catch (error) {
    return { error: error.message };
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
  write: tool({
    description: "Write content to a file",
    inputSchema: z.object({
      path: z.string().describe("Path to the file to write"),
      content: z.string().describe("Content to write to the file"),
    }),
    execute: writeFileTool,
  }),
  glob: tool({
    description: "Find files matching a glob pattern",
    inputSchema: z.object({
      pattern: z.string().describe("Glob pattern (e.g., '*.ts')"),
      cwd: z.string().optional().describe("Directory to search in"),
    }),
    execute: globTool,
  }),
  memory_search: tool({
    description:
      "Search through memory and knowledge files (MEMORY.md, knowledge.md) for specific content",
    inputSchema: z.object({
      query: z.string().describe("Search query to find in memory files"),
    }),
    execute: memorySearchTool,
  }),
  memory_get: tool({
    description: "Get the full content of a memory or knowledge file",
    inputSchema: z.object({
      file: z
        .string()
        .optional()
        .describe("File to read: MEMORY.md (default), knowledge.md, or CLAUDE.md"),
    }),
    execute: memoryGetTool,
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
  {
    id: "symphony/ollama-qwen3-coder-next",
    ownedBy: "ollama-local",
    allowedNames: ["ollama-local"],
  },
];

// Accept multiple valid tokens - configured via env var or default
const additionalTokens = (process.env.SYMPHONY_BRIDGE_ACCEPTED_TOKENS || "")
  .split(",")
  .map((t) => t.trim())
  .filter(Boolean);

const VALID_TOKENS = new Set([API_KEY, ...additionalTokens]);

if (VALID_TOKENS.size > 1) {
  logDebug(`Auth: accepting ${VALID_TOKENS.size} tokens`);
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

// Continuous provider probe — runs in parallel, re-evaluates after 3 completions
const PROBE_CYCLE_INTERVAL_MS = 30 * 60 * 1000; // 30 min between probe cycles
const PROBE_CYCLE_TURN_THRESHOLD = 200; // Re-evaluate after 200 turns of current provider
const PROBE_COMPLETIONS_BEFORE_RANKING = 3; // Rank providers after 3 probe completions
let probeCompletionCount = 0;
let probeTurnCounter = 0; // Tracks turns since last probe
let lastProbeStartTime = Date.now();
let isProbeRunning = false;

// Track concurrent requests for Discord notifications
const activeRequests = new Map(); // requestId -> { startTime, issueId, model, stream, filesChanged }
let requestIdCounter = 0;
let processingStatusTimer = null;

// ---------------------------------------------------------------------------
// Continuous provider probe — runs in parallel, updating status continuously
// ---------------------------------------------------------------------------

/**
 * Run continuous provider probe in background.
 * 
 * Sequential process:
 * 1. Filter out failed/excluded/cooldown providers
 * 2. Check reachability and API keys (parallel, all eligible providers)
 * 3. Probe tool capability for reachable providers (parallel, all providers)
 * 4. After 3 completions, rank and log all providers in metrics cache
 * 
 * Repeats every 30 minutes OR 200 turns of the current provider.
 */
async function runContinuousProviderProbe() {
  if (isProbeRunning) {
    logDebug(`🔍 Probe already running, skipping duplicate`);
    return;
  }

  isProbeRunning = true;
  lastProbeStartTime = Date.now();
  probeTurnCounter = 0; // Reset turn counter

  try {
    logInfo(`🔍 Starting continuous provider probe cycle ${probeCompletionCount + 1}...`);

    // Phase 1: Filter out failed/excluded/cooldown providers
    const excludeNames = [...BRIDGE_PROVIDER_BLOCKLIST];
    const allProviders = getProviderDefinitions({ excludeNames });
    const eligibleProviders = allProviders.filter((p) => !isRecentlyFailed(p.name));
    
    logInfo(
      `🔍 Phase 1: Filtered ${allProviders.length} providers → ${eligibleProviders.length} eligible (excluded cooldown/failed)`,
    );

    // Phase 2: Check reachability and API keys (parallel, all eligible providers)
    logInfo(`🔍 Phase 2: Probing reachability for ${eligibleProviders.length} providers...`);
    providerStatusCache.configured = getConfiguredProviders({ excludeNames });
    providerStatusCache.probeResults = await probeAllProviders({ excludeNames });
    providerStatusCache.lastProbeAt = new Date().toISOString();

    const reachable = providerStatusCache.probeResults.filter((r) => r.available);
    const total = providerStatusCache.configured.length;
    logInfo(
      `🔍 Phase 2 complete: ${reachable.length}/${total} providers reachable (API keys validated)`,
    );

    // Phase 3: Probe tool capability for reachable providers (parallel, all providers)
    logInfo(`🔍 Phase 3: Probing tool capability for ${reachable.length} reachable providers...`);
    await probeAllToolCapability();
    logInfo(
      `🔍 Phase 3 complete: ${toolCapableProviders.size} capable, ${nonToolCapableProviders.size} excluded`,
    );

    // Increment completion counter
    probeCompletionCount++;

    // Phase 4: After 3 completions, rank and log all providers in metrics cache
    if (probeCompletionCount >= PROBE_COMPLETIONS_BEFORE_RANKING) {
      logInfo(
        `🔍 Phase 4: Ranking providers after ${probeCompletionCount} probe completions...`,
      );
      const ranked = getRankedProviders({ excludeNames: [...nonToolCapableProviders] });
      if (ranked.length > 0) {
        logInfo(`🔍 Provider Rankings (top 10):`);
        for (const { rank, name, score, tier } of ranked.slice(0, 10)) {
          const stats = getProviderStats()[name];
          const selections = stats?.selections || 0;
          const successRate = stats?.successRate || "N/A";
          logInfo(
            `  #${rank} ${name} [${tier}]: score=${score}, ${selections} sel, ${successRate} success`,
          );
        }
        logInfo(`🔍 Full ranking cached in provider stats`);
      }
      // Reset counter but keep probing
      probeCompletionCount = 0;
    }

    logInfo(
      `🔍 Probe cycle complete (${probeCompletionCount}/${PROBE_COMPLETIONS_BEFORE_RANKING} before next ranking)`,
    );
  } catch (err) {
    logError(`🔍 Continuous probe error: ${err.message}`);
  } finally {
    isProbeRunning = false;
  }
}

// ---------------------------------------------------------------------------
// Provider status cache — continuously updated by background probe
// ---------------------------------------------------------------------------

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
    logDebug(`🔄 Provider status refreshed: ${available}/${total} available`);

    // Phase 2: probe tool-calling capability for all available providers
    await probeAllToolCapability();
  } catch (err) {
    logError(`Provider probe error: ${err.message}`);
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
  let errStr = "";
  try {
    errStr = (typeof err === "string" ? err : errorToString(err)).toLowerCase();
  } catch {
    // If errorToString fails, treat as non-retryable
    return false;
  }

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
    errStr.includes("failed_generation") ||
    errStr.includes("logDebug is not defined"); // Defensive: catch this specific error

  // Only log if logDebug is actually defined (defensive)
  if (typeof logDebug === "function") {
    if (
      isRetryable &&
      (errStr.includes("codebuff") || errStr.includes("credits") || errStr.includes("payment"))
    ) {
      logDebug(`💳 Detected retryable credit/payment error: ${errStr.slice(0, 150)}`);
    }

    // Log connection errors for debugging
    if (
      isRetryable &&
      (errStr.includes("econnrefused") ||
        errStr.includes("econnreset") ||
        errStr.includes("aborted") ||
        errStr.includes("socket"))
    ) {
      logDebug(`🔌 Detected retryable connection error: ${errStr.slice(0, 150)}`);
    }
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

// Safe logDebug wrapper that checks if function exists
const safeLogDebug = typeof logDebug === "function" ? logDebug : () => {};

function buildSelectionOptions(route, excludedNames = [], sessionId = null) {
  const excludeSet = new Set([...excludedNames, ...nonToolCapableProviders]);

  // Check if evaluation cycle wants to force-sample a specific provider
  const stats = getProviderStats();
  const allProviderNames =
    route.allowedNames || Object.keys(stats).filter((n) => !excludeSet.has(n));
  const evaluationSample = getEvaluationSampleProvider(allProviderNames, stats);

  if (evaluationSample) {
    safeLogDebug(`🔍 Evaluation cycle: forcing sample of "${evaluationSample}"`);
    return {
      allowedNames: [evaluationSample],
      excludeNames: [...excludeSet],
    };
  }

  // Check session state for sticky provider
  if (sessionId) {
    const sessionState = getSessionProvider(sessionId);
    if (sessionState) {
      const { provider: providerName, mode, tier, turnCount } = sessionState;
      const turnLimit = getProviderTurnLimit(providerName);

      // Paid providers: stick until exhausted
      if (tier === "paid" && mode === "paid") {
        safeLogDebug(`📌 Session sticky: ${providerName} (paid mode, ${turnCount} turns)`);
        return {
          allowedNames: [providerName],
          excludeNames: [...excludeSet],
        };
      }

      // Free providers: rotate after turn limit
      if (turnCount < turnLimit) {
        safeLogDebug(`📌 Session sticky: ${providerName} (${turnCount}/${turnLimit} turns)`);
        return {
          allowedNames: [providerName],
          excludeNames: [...excludeSet],
        };
      } else {
        safeLogDebug(`🔄 Rotating: ${providerName} (${turnCount}/${turnLimit} turns reached)`);
        // Exclude current provider to force rotation
        excludeSet.add(providerName);
        clearSessionProvider(sessionId);
      }
    }
  }

  return {
    allowedNames: route.allowedNames,
    excludeNames: [...excludeSet],
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
    logDebug(`🔧 ${name} probe error`, { name, error: errStr.slice(0, 150) });
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
    logDebug(`🔧 Tool probe: all providers already classified`);
    return;
  }

  logDebug(`🔧 Tool capability probe: testing ${toProbe.length} providers...`);

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
    logDebug(`  ${icon} ${r.name}: ${r.status}`);
  }

  logDebug(
    `🔧 Tool probe complete: ${toolCapableProviders.size} capable, ${nonToolCapableProviders.size} excluded`,
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
      logDebug(
        `🔧 Scheduling tool probe retry in ${TOOL_PROBE_RETRY_DELAY_MS / 1000}s for ${names.length} unclassified: ${names.join(", ")}`,
      );
      setTimeout(async () => {
        try {
          logDebug(`🔧 Retry tool probe for ${names.length} unclassified providers...`);
          await probeAllToolCapability();
          const remaining = names.filter(
            (n) => !toolCapableProviders.has(n) && !nonToolCapableProviders.has(n),
          );
          if (remaining.length > 0) {
            logDebug(`🔧 Still unclassified after retry: ${remaining.join(", ")}`);
          }
        } catch (err) {
          logError(`Tool probe retry failed: ${err.message}`);
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

  logDebug(`[invokeWithAI] Entry`, {
    providerName: provider.name,
    providerModel: provider.model,
    stream,
    messageCount: messages?.length,
    hasOnChunk: !!onChunk,
  });

  if (provider.driver === "codex-sdk" || provider.name === "codex") {
    logDebug(`[invokeWithAI] Routing to Codex SDK`, { providerName: provider.name });
    return invokeWithCodex(provider, messages, options);
  }

  // Create the provider model
  const model = createProviderModel(provider);

  if (!model) {
    logError(`[invokeWithAI] Failed to create provider model`, {
      providerName: provider.name,
      providerModel: provider.model,
    });
    throw new Error(`Provider ${provider.name} not supported with AI SDK`);
  }

  const useTools = providerSupportsTools(provider.name);
  logInfo(
    `Using AI SDK with provider: ${provider.name} (${provider.model})${useTools ? "" : " [no-tools]"}`,
  );
  logDebug(`[invokeWithAI] Provider configuration`, {
    providerName: provider.name,
    providerModel: provider.model,
    useTools,
    hasBaseUrl: !!provider.baseUrl,
    hasApiKey: !!provider.apiKey,
  });

  // Convert messages to AI SDK format and truncate for provider's context limit
  logDebug(`[invokeWithAI] Converting messages`, { messageCount: messages?.length });
  const rawMessages = convertMessages(messages);
  logDebug(`[invokeWithAI] Messages after conversion`, {
    rawMessageCount: rawMessages?.length,
    totalChars: rawMessages?.reduce(
      (sum, m) => sum + (typeof m.content === "string" ? m.content.length : 0),
      0,
    ),
  });

  const aiMessages = truncateMessagesForProvider(rawMessages, provider.name);
  logDebug(`[invokeWithAI] Messages after truncation`, {
    aiMessageCount: aiMessages?.length,
    providerName: provider.name,
    wasChanged: aiMessages?.length !== rawMessages?.length,
  });

  // Validation: truncateMessagesForProvider guarantees at least one message,
  // but double-check to catch any edge cases
  if (!aiMessages || aiMessages.length === 0) {
    logError(`❌ CRITICAL: Message truncation failed for provider ${provider.name}`, {
      originalMessageCount: messages?.length || 0,
      rawMessageCount: rawMessages?.length || 0,
      aiMessageCount: aiMessages?.length,
      providerName: provider.name,
    });
    throw new Error(
      `CRITICAL: Message truncation failed for provider ${provider.name} - original had ${messages?.length || 0} messages`,
    );
  }

  if (stream) {
    logDebug(`[invokeWithAI] Starting streaming invocation`, {
      providerName: provider.name,
      useTools,
      maxIterations: MAX_TOOL_ITERATIONS,
    });
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
            logDebug(`🔧 ${tc.toolName}: ${summary}`);

            // Track file changes for write tool
            if (tc.toolName === "write" && currentRequestId) {
              trackFileChange(currentRequestId);
            }
          }
        }
      },
      onFinish: (event) => {
        finishReason = event.finishReason;
        logInfo(`[invokeWithAI] Stream finished`, {
          finishReason,
          textLength: event.text?.length || 0,
          hasUsage: !!event.usage,
          inputTokens: event.usage?.promptTokens,
          outputTokens: event.usage?.completionTokens,
        });
        if (finishReason === "error" || !event.text) {
          logWarn(
            `⚠️ Stream finished: reason=${finishReason}, text=${event.text?.length || 0} chars`,
            { finishReason, textLength: event.text?.length || 0 },
          );
        }
        if (finishReason === "tool-calls") {
          logWarn(
            `⚠️ Model hit step limit (${MAX_TOOL_ITERATIONS}) while still executing tools — response may be truncated`,
            { maxIterations: MAX_TOOL_ITERATIONS, finishReason },
          );
        }
      },
    });

    // Process the full stream — includes reasoning, text, tool-call, and tool-result events
    let fullText = "";
    let fullTextCapped = false;
    let streamErrorDetail = null;
    let hasTextDeltas = false;
    let partCount = 0;
    let textDeltaCount = 0;
    let toolCallCount = 0;
    let errorCount = 0;

    logDebug(`[invokeWithAI] Processing fullStream...`);
    for await (const part of result.fullStream) {
      partCount++;
      logDebug(`[invokeWithAI] Stream part ${partCount}`, { type: part.type });
      // Track if we're receiving text-delta events (for fallback detection)
      if (part.type === "text-delta") {
        hasTextDeltas = true;
        textDeltaCount++;
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
            logWarn(`⚠️ fullText capped at ${MAX_RESPONSE_TEXT_BYTES} bytes`, {
              currentLength: fullText.length,
              deltaLength: delta.length,
              maxBytes: MAX_RESPONSE_TEXT_BYTES,
            });
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
          logDebug(`📨 text-delta (${delta.length} chars): ${delta.slice(0, 200)}`, {
            deltaLength: delta.length,
            totalLength: fullText.length,
          });
        }
      } else if (part.type === "tool-call") {
        toolCallCount++;
        const argsSummary = part.args ? JSON.stringify(part.args).slice(0, 200) : "";
        logInfo(`🔧 ${part.toolName}: ${argsSummary}`);
        logDebug(`[invokeWithAI] Tool call ${toolCallCount}`, {
          toolName: part.toolName,
          toolCallId: part.toolCallId,
          argsKeys: part.args ? Object.keys(part.args) : [],
        });
        if (onChunk) {
          onChunk({ type: "text", text: `\n🔧 ${part.toolName}: \n` });
        }
      } else if (part.type === "tool-result") {
        logInfo(`✅ ${part.toolName} done`);
        logDebug(`[invokeWithAI] Tool result`, {
          toolName: part.toolName,
          toolCallId: part.toolCallId,
          hasResult: !!part.result,
          resultType: typeof part.result,
        });
        if (onChunk) {
          onChunk({ type: "text", text: `✅ ${part.toolName} done\n` });
        }
      } else if (part.type === "error") {
        errorCount++;
        const streamError = part.error || part;
        const rootError = unwrapAIError(streamError);
        const errorMsg = errorToString(rootError);
        streamErrorDetail = streamErrorDetail || errorMsg;
        // Log server-side only - internal provider errors are handled by auto-fallback
        logWarn(
          `🔧 Internal provider error (auto-fallback will retry): ${errorMsg.slice(0, 150)}`,
          {
            providerName: provider.name,
            errorType: streamError?.constructor?.name,
            isRetryable: isRetryableErrorDeep(streamError),
          },
        );
        logDebug(`[invokeWithAI] Stream error ${errorCount}`, {
          errorMsg: errorMsg.slice(0, 500),
          errorType: streamError?.constructor?.name,
          hasResponseBody: !!rootError?.responseBody,
          statusCode: rootError?.statusCode,
        });
        // DO NOT forward error events to client - these are internal Symphony routing errors
      } else if (part.type === "finish") {
        if (part.finishReason) {
          finishReason = part.finishReason;
        }
        logDebug(`[invokeWithAI] Finish event`, { finishReason: part.finishReason });
      }
    }

    logInfo(`[invokeWithAI] Stream processing complete`, {
      partCount,
      textDeltaCount,
      toolCallCount,
      errorCount,
      finalTextLength: fullText.length,
      hasTextDeltas,
      finishReason,
    });

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
            logDebug(
              `⚠️ fullStream produced no text-delta events (${provider.name} buffered), recovered ${fallbackText.length} chars from result.text`,
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
        logDebug(`⚠️ result.text fallback also failed: ${String(textErr).slice(0, 100)}`);
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
      logWarn(
        `⚠️ ${provider.name} emitted tool calls as raw JSON text — marking as non-tool-capable for future requests`,
      );
      nonToolCapableProviders.add(provider.name);
    }

    logDebug(`Streaming completed (${fullText.length} chars)`);

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
      logWarn(
        `⚠️ Model hit step limit (${MAX_TOOL_ITERATIONS}) while still executing tools — response may be truncated`,
      );
      text +=
        "\n\n---\n⚠️ Response truncated: the model was still working when it reached the tool-execution step limit. The results above may be incomplete.";
    }

    // Runtime safety net (non-streaming): detect raw JSON tool output and cascade to next provider
    if (useTools && text && RAW_TOOL_JSON_RE.test(text)) {
      logWarn(
        `⚠️ ${provider.name} emitted tool calls as raw JSON text — marking as non-tool-capable`,
      );
      nonToolCapableProviders.add(provider.name);
      throw new Error(
        `Provider ${provider.name} does not support structured tool calling — excluded`,
      );
    }

    logDebug(`Completion done`);

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
async function invokeWithFallback(messages, route, sessionId = null) {
  const triedProviders = [];
  let lastError = null;
  let attemptNumber = 0;

  logDebug(`[invokeWithFallback] Starting fallback cascade`, {
    routeModelId: route.responseModelId,
    allowedNames: route.allowedNames,
    sessionId: sessionId ? sessionId.slice(0, 12) + "..." : null,
    messageCount: messages?.length,
  });

  // Check if it's time for periodic evaluation
  if (shouldTriggerEvalCycle()) {
    logInfo(`🔍 Periodic evaluation cycle: sampling underused providers`);
  }

  // Keep trying providers until we run out
  while (attemptNumber < 10) {
    attemptNumber++;
    logDebug(`[invokeWithFallback] Attempt ${attemptNumber}/10`, {
      triedProviders,
      lastError: lastError ? lastError.slice(0, 100) : null,
    });

    // Get next provider from credit-gate (excluding already-tried ones)
    const provider = await selectProvider(buildSelectionOptions(route, triedProviders, sessionId));

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
      logError(`[invokeWithFallback] No provider available`, {
        attemptNumber,
        triedProviders,
        excludedByProbe,
        routeModelId: route.responseModelId,
        lastError: lastError ? lastError.slice(0, 200) : null,
      });
      throw new Error(errorMsg);
    }

    logInfo(
      `${attemptNumber === 1 ? "Selected" : "Fallback"} provider (attempt ${attemptNumber}): ${provider.name} (${provider.model})`,
    );
    triedProviders.push(provider.name);

    if (attemptNumber > 1) {
      BRIDGE_METRICS.totalFallbacks++;
      await sleep(FALLBACK_DELAY_MS);
    }

    try {
      const startedAt = Date.now();
      logDebug(`[invokeWithFallback] Invoking provider`, {
        providerName: provider.name,
        attemptNumber,
      });
      const result = await invokeWithAI(provider, messages, { stream: false });

      const durationMs = Date.now() - startedAt;
      logInfo(`✅ Success with ${provider.name} (attempt ${attemptNumber})`, {
        durationMs,
        textLength: result.text?.length,
        hasUsage: !!result.usage,
      });
      recordProviderSuccess(provider.name);
      recordSuccessfulMetrics(provider.name, startedAt, result.usage);

      // Update session state
      if (sessionId) {
        const mode =
          detectCodebuffMode(result) || (provider.name === "codebuff" ? "unknown" : null);
        updateSessionProvider(sessionId, { name: provider.name, mode, tier: provider.tier });
      }

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
      const isRetryable = isRetryableErrorDeep(err);
      logWarn(`❌ ${provider.name} failed (attempt ${attemptNumber}): ${errStr.slice(0, 100)}`, {
        providerName: provider.name,
        attemptNumber,
        isRetryable,
        errorType: err?.constructor?.name,
      });
      logDebug(`[invokeWithFallback] Provider failure details`, {
        providerName: provider.name,
        errorMessage: errStr.slice(0, 500),
        isRetryable,
        willRecordFailure: isRetryable,
      });

      if (isRetryable) {
        recordProviderFailure(provider.name);
        recordProviderFailureCount(provider.name);
      }

      // Continue to next provider in the loop
    }
  }

  // If we exhausted all attempts
  const finalError = `All providers failed after ${attemptNumber} attempts (tried ${triedProviders.join(", ")}). Last error: ${lastError || "unknown"}`;
  logError(`[invokeWithFallback] All providers exhausted`, {
    attemptCount: attemptNumber,
    triedProviders,
    lastError: lastError ? lastError.slice(0, 200) : null,
  });
  throw new Error(finalError);
}

/**
 * Transparent SSE relay for Codebuff - forwards raw SSE chunks directly to OpenClaw
 * without AI SDK buffering. This preserves real-time activity messages (✅ done, 🔧 read:, etc.)
 * that the AI SDK would otherwise buffer until the end.
 *
 * @param {Array} messages - Chat messages
 * @param {http.ServerResponse} res - HTTP response for SSE streaming
 * @param {string|null} sessionId - OpenClaw session ID for tool proxying
 * @param {Function|null} onDiscordChunk - Optional callback for streaming to Discord (text) => void
 */
function invokeCodebuffDirectStream(messages, res, sessionId = null, onDiscordChunk = null) {
  return new Promise((resolve, reject) => {
    const requestBody = JSON.stringify({
      model: "codebuff/base",
      messages,
      stream: true,
    });

    logDebug(`🌊 Transparent SSE relay: forwarding Codebuff stream directly (bypasses AI SDK)`);

    const headers = {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(requestBody),
      Authorization: "Bearer local-bridge",
    };

    // Forward OpenClaw session ID to Codebuff bridge for tool proxying
    if (sessionId) {
      headers["X-OpenClaw-Session"] = sessionId;
      logDebug(`🔗 Forwarding session ID to Codebuff bridge`, {
        sessionId: sessionId.slice(0, 12) + "...",
      });
    }

    const options = {
      hostname: "127.0.0.1",
      port: 4318,
      path: "/v1/chat/completions",
      method: "POST",
      headers,
    };

    const proxyReq = http.request(options, (proxyRes) => {
      if (proxyRes.statusCode !== 200) {
        let errorBody = "";
        proxyRes.on("data", (chunk) => (errorBody += chunk));
        proxyRes.on("end", () => {
          reject(new Error(`Codebuff bridge returned ${proxyRes.statusCode}: ${errorBody}`));
        });
        return;
      }

      let fullText = "";
      let logBuffer = ""; // Accumulate text for readable logging
      const LOG_BUFFER_THRESHOLD = 150; // Log when buffer exceeds ~150 chars

      // Internal SDK activity patterns (complete markers to filter out of logs)
      const INTERNAL_PATTERNS = [
        /✅ set_messages done\n?/,
        /✅ spawn_agent_inline done\n?/,
        /✅ context-pruner done\n?/,
        /✅ end_turn done\n?/,
      ];

      proxyRes.on("data", (chunk) => {
        const chunkStr = chunk.toString();

        // Forward raw chunks directly to OpenClaw (no filtering)
        res.write(chunk);

        // Extract content for logging, accumulation, and Discord streaming
        const lines = chunkStr.split("\n");
        for (const line of lines) {
          const dataMatch = line.match(/^data: (.+)$/);
          if (!dataMatch || dataMatch[1] === "[DONE]") continue;

          try {
            const parsed = JSON.parse(dataMatch[1]);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content && content.length > 0) {
              fullText += content;
              logBuffer += content;

              // Stream ALL content to Discord (including activity messages)
              if (onDiscordChunk) {
                onDiscordChunk(content);
              }

              // Filter out internal activity markers for logging only
              let filteredLogBuffer = logBuffer;
              for (const pattern of INTERNAL_PATTERNS) {
                filteredLogBuffer = filteredLogBuffer.replace(pattern, "");
              }

              // Log when buffer exceeds threshold or contains sentence boundary
              const hasSentenceEnd =
                /[.!?]\s/.test(filteredLogBuffer) || filteredLogBuffer.includes("\n\n");
              if (filteredLogBuffer.length >= LOG_BUFFER_THRESHOLD || hasSentenceEnd) {
                const toLog = filteredLogBuffer.trim();
                if (toLog.length > 0) {
                  logDebug(`🌊 ${toLog.slice(0, 200)}`);
                }
                logBuffer = ""; // Clear buffer after logging
              }
            }
          } catch {
            // Parse error - ignore
          }
        }
      });

      proxyRes.on("end", async () => {
        // Log any remaining buffered text
        if (logBuffer.trim().length > 0) {
          logDebug(`🌊 ${logBuffer.trim().slice(0, 200)}`);
        }

        // Flush any remaining Discord stream buffer
        await flushDiscordStream({ emoji: "" }).catch(() => {
          /* ignore */
        });

        logDebug(`🌊 Relay complete: ${fullText.length} chars`);
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
async function invokeWithFallbackStream(
  messages,
  route,
  onChunk,
  initialExcluded = [],
  sessionId = null,
) {
  const triedProviders = [...initialExcluded];
  let lastError = null;
  let attemptNumber = 0;

  // Keep trying providers until we run out (higher limit for streaming due to rate limits)
  while (attemptNumber < 15) {
    attemptNumber++;

    // Get next provider from credit-gate (excluding already-tried ones)
    const provider = await selectProvider(buildSelectionOptions(route, triedProviders, sessionId));

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

    logInfo(
      `${attemptNumber === 1 ? "Streaming selected" : "Streaming fallback"} provider (attempt ${attemptNumber}): ${provider.name} (${provider.model})`,
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

      logInfo(`✅ Streaming success with ${provider.name} (attempt ${attemptNumber})`);
      recordProviderSuccess(provider.name);
      recordSuccessfulMetrics(provider.name, startedAt);

      // Update session state
      if (sessionId) {
        const mode =
          detectCodebuffMode(result) || (provider.name === "codebuff" ? "unknown" : null);
        updateSessionProvider(sessionId, { name: provider.name, mode, tier: provider.tier });
      }

      requestCount++;
      probeTurnCounter++; // Track turns for probe triggering
      if (requestCount % STATS_LOG_INTERVAL === 0) {
        logBridgeStats();
      }

      // Trigger probe cycle if turn threshold reached
      if (probeTurnCounter >= PROBE_CYCLE_TURN_THRESHOLD) {
        logInfo(
          `🔍 Turn threshold reached (${probeTurnCounter}/${PROBE_CYCLE_TURN_THRESHOLD}), scheduling probe cycle...`,
        );
        // Schedule probe asynchronously (don't block response)
        setTimeout(() => {
          runContinuousProviderProbe().catch((err) => {
            logError(`Scheduled probe failed: ${err.message}`);
          });
        }, 0);
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
      logWarn(
        `❌ Streaming ${provider.name} failed (attempt ${attemptNumber}): ${errStr.slice(0, 200)}`,
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
  logDebug(`Auth check: received token="${token}", valid=${isValid}`);
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

  logDebug(`📊 Bridge Stats (last ${elapsed}s):`);
  logDebug(
    `  Total: ${BRIDGE_METRICS.totalRequests} requests | ${BRIDGE_METRICS.streamingRequests} stream | ${BRIDGE_METRICS.nonStreamingRequests} non-stream`,
  );
  logDebug(
    `  Errors: ${BRIDGE_METRICS.totalErrors} | Fallbacks: ${BRIDGE_METRICS.totalFallbacks} | Tool calls: ${BRIDGE_METRICS.totalToolCalls}`,
  );
  logDebug(
    `  Latency: ${BRIDGE_METRICS.avgResponseTimeMs}ms avg | ${BRIDGE_METRICS.minResponseTimeMs}ms min | ${BRIDGE_METRICS.maxResponseTimeMs}ms max`,
  );
  logDebug(`  Tokens: ${BRIDGE_METRICS.totalTokensIn} in | ${BRIDGE_METRICS.totalTokensOut} out`);

  const topProviders = Object.entries(BRIDGE_METRICS.requestsByProvider)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  if (topProviders.length > 0) {
    const providerStrings = topProviders.map(([k, v]) => k + ":" + v);
    logDebug(`  Top providers: ${providerStrings.join(", ")}`);
  }

  const topErrors = Object.entries(BRIDGE_METRICS.errorsByType)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  if (topErrors.length > 0) {
    const errorStrings = topErrors.map(([k, v]) => k + ":" + v);
    logDebug(`  Top errors: ${errorStrings.join(", ")}`);
  }

  BRIDGE_METRICS.lastStatsLog = now;

  // Self-tune adaptive parameters
  const stats = getProviderStats();
  tuneAdaptiveParams(stats);

  logProviderStats({ excludeNames: nonToolCapableProviders });

  const timeSinceProbe = Math.round((Date.now() - lastProbeStartTime) / 60000);
  logDebug(
    `🔍 Provider probe: ${probeCompletionCount}/${PROBE_COMPLETIONS_BEFORE_RANKING} completions, ${probeTurnCounter}/${PROBE_CYCLE_TURN_THRESHOLD} turns, ${timeSinceProbe}min since last cycle`,
  );

  // Log adaptive params
  const adaptiveParams = getAdaptiveParams();
  const customLimits = Object.entries(adaptiveParams.freeTurnLimit.perProvider)
    .map(([p, l]) => `${p}:${l}`)
    .join(", ");
  if (customLimits) {
    logDebug(`🎯 Adaptive turn limits: ${customLimits}`);
  }

  // Cleanup expired sessions
  cleanupExpiredSessions();
}

// -------------------------------------------------------------------------->
// Main request handler
// --------------------------------------------------------------------------<

const server = http.createServer(async (req, res) => {
  logDebug(`===== REQUEST =====`);
  logDebug(`method: ${req.method}, url: ${req.url}`);

  try {
    const skipAuth =
      req.url === "/health" || req.url === "/v1/models" || req.url === "/v1/providers";
    if (!skipAuth && !checkAuth(req)) {
      logWarn(`Auth failed for ${req.method} ${req.url}`);
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
        logError(`Manual probe error: ${err.message}`);
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
        logWarn(`⚠️ Request parse error: ${parseErr.message}`);
        return sendJson(res, 400, {
          error: {
            message: "Invalid request body: not valid JSON",
            type: "invalid_request_error",
          },
        });
      }

      const messages = Array.isArray(body.messages) ? body.messages : undefined;
      const sessionId = req.headers["x-openclaw-session"] || null;

      // Fast validation BEFORE route resolution - fail immediately on invalid input
      if (!messages || messages.length === 0) {
        logWarn(`⚠️ Empty messages array received - returning 400 immediately`);
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
        logWarn(`⚠️ Empty model field - using default`);
      }

      const route = resolveRoute(body.model || MODEL_ID);
      const stream = body.stream === true;

      // Log message summary for debugging
      logInfo(
        `📨 Request messages: ${messages.length} total (${messages.filter((m) => m.role === "system").length} system, ${messages.filter((m) => m.role === "user").length} user, ${messages.filter((m) => m.role === "assistant").length} assistant)`,
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
        logInfo(`🚀 Request: ${issueContext.identifier} — ${issueContext.title}`);
      }

      logInfo(
        `Chat completion: requestedModel=${route.requestedModelId}, routedModel=${route.responseModelId}, messages=${messages.length}, stream=${stream}`,
      );
      logMemory("request-start");

      // Send Discord notification that we're starting to process (for ALL requests)
      const lastUserMessage = messages[messages.length - 1];
      const rawContent = lastUserMessage?.content;

      // Extract text from content (handle both string and array formats)
      let contentStr = "";
      if (typeof rawContent === "string") {
        contentStr = rawContent;
      } else if (Array.isArray(rawContent)) {
        // Extract text parts from array content
        contentStr = rawContent
          .filter((part) => part.type === "text")
          .map((part) => part.text)
          .join(" ");
      } else if (rawContent && typeof rawContent === "object") {
        contentStr = JSON.stringify(rawContent);
      }

      const startTime = Date.now();
      const requestId = `req-${++requestIdCounter}`;

      // Set current request ID for file change tracking
      setCurrentRequestId(requestId);

      // Track this request
      activeRequests.set(requestId, {
        startTime,
        issueId: issueContext?.identifier || null,
        requestText: contentStr.slice(0, 200),
        model: route.responseModelId,
        stream,
        filesChanged: 0,
      });

      // Fire-and-forget Discord notification (non-blocking)
      const concurrentCount = activeRequests.size - 1; // Exclude current request
      const concurrentRequests = Array.from(activeRequests.values()).filter(
        (r) => r.startTime !== startTime, // Exclude current request
      );

      const fields = [];

      if (concurrentCount > 0) {
        // Build detailed concurrent request summary with actual request text
        const concurrentSummaries = concurrentRequests.slice(0, 3).map((r) => {
          const prefix = r.issueId ? `${r.issueId}: ` : "";
          return prefix + (r.requestText || "(no text)");
        });

        let concurrentText = concurrentSummaries.join("\n");

        if (concurrentCount > concurrentSummaries.length) {
          concurrentText += `\n...and ${concurrentCount - concurrentSummaries.length} more`;
        }

        fields.push({
          name: `Concurrent (${concurrentCount})`,
          value: concurrentText,
          inline: false,
        });
      }

      sendDiscordEmbed({
        title: issueContext?.identifier || "Processing Request",
        description: issueContext?.title || contentStr.slice(0, 200) || "(no description)",
        color: 0xffa500, // Orange
        fields,
      }).catch((err) => logDebug(`Discord webhook failed: ${err.message}`));

      // Progress logger — log elapsed time periodically during long requests
      // AND send Discord updates every 30 seconds
      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        logDebug(
          `⏱️ Request in progress: ${formatElapsed(elapsed)} elapsed (model=${route.responseModelId}, stream=${stream})`,
        );
        logMemory("request-progress");

        // No progress updates - only initial and completion messages
      }, 30_000); // Log every 30 seconds

      // Hard request timeout — prevents infinite hangs regardless of provider state
      const requestTimeoutHandle = setTimeout(() => {
        const elapsed = Date.now() - startTime;
        logError(`⏱️ ❌ REQUEST TIMEOUT after ${formatElapsed(elapsed)} — force-closing response`);
        logMemory("request-timeout");
        activeRequests.delete(requestId);
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
          logError(`Timeout cleanup error: ${e.message}`);
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
        // Only use if Codebuff is SELECTED by credit-gate (not just allowed)

        // First, let credit-gate select the best provider (with session awareness)
        const selectedProvider = await selectProvider(buildSelectionOptions(route, [], sessionId));

        logInfo(
          `🔍 Credit-gate selected: ${selectedProvider?.name || "none"} (route=${route.normalizedModelId})`,
        );

        if (selectedProvider?.name === "codebuff") {
          try {
            logInfo(
              `🌊 Using transparent SSE relay for Codebuff (real-time streaming, bypasses AI SDK)`,
            );

            // Stream output to Discord as it's received (immediate, no buffering)
            const streamToDiscord = (text) => {
              if (text && text.length > 0) {
                // Send immediately for real-time feedback
                streamDiscordUpdate(text, { emoji: "" }).catch(() => {
                  /* ignore */
                });
              }
            };

            const result = await invokeCodebuffDirectStream(
              messages,
              res,
              sessionId,
              streamToDiscord,
            );

            clearInterval(heartbeat);
            clearInterval(progressInterval);
            clearTimeout(requestTimeoutHandle);

            // Codebuff bridge already sends [DONE], but send it again to ensure completion
            res.write("data: [DONE]\n\n");
            res.end();

            // Clean up request tracking
            activeRequests.delete(requestId);
            setCurrentRequestId(null);

            logInfo(
              `✅ Finished: ${issueContext?.identifier || "Request"} (provider: codebuff, ${result.text.length} chars)`,
            );

            // Send comprehensive completion metrics (non-blocking)
            sendDiscordEmbed({
              title: "Completed Request",
              description: issueContext?.title || contentStr.slice(0, 200) || "(no description)",
              color: 0x00ff00, // Green
              fields: [
                { name: "Issue", value: issueContext?.identifier || "N/A", inline: true },
                { name: "Output", value: `${result.text.length} chars`, inline: true },
                { name: "Model", value: "codebuff", inline: true },
              ],
            }).catch((err) => logDebug(`Discord webhook failed: ${err.message}`));

            const durationMs = Date.now() - startTime;
            recordBridgeMetrics({
              provider: "codebuff",
              durationMs,
              isStream: true,
              isError: false,
            });
            recordProviderSuccess("codebuff");
            recordSuccessfulMetrics("codebuff", startTime);

            // Update session state for codebuff
            if (sessionId) {
              // Detect mode from response or errors
              const mode = result.mode || "unknown";
              updateSessionProvider(sessionId, { name: "codebuff", mode, tier: "paid" });
            }
            maybeGC();
            return;
          } catch (codebuffErr) {
            const errMsg = String(codebuffErr.message || codebuffErr).slice(0, 200);
            logWarn(`⚠️ Codebuff transparent relay failed: ${errMsg}`);

            // Record failure and fall through to standard cascade
            if (isRetryableErrorDeep(codebuffErr)) {
              recordProviderFailure("codebuff");
              recordProviderFailureCount("codebuff");
            }
            logInfo(`🔄 Falling back to standard provider cascade (excluding codebuff)...`);
            // Fall through to standard fallback cascade, excluding the failed codebuff
          }
        }

        // If codebuff was tried and failed, exclude it from the cascade
        const excludeAfterCodebuff = selectedProvider?.name === "codebuff" ? ["codebuff"] : [];

        try {
          const result = await invokeWithFallbackStream(
            messages,
            route,
            (chunk) => {
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
            },
            excludeAfterCodebuff,
            sessionId,
          );

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

          // Clean up request tracking
          activeRequests.delete(requestId);
          setCurrentRequestId(null);

          logInfo(
            `✅ Finished: ${issueContext?.identifier || "Request"} (provider: ${result.providerName})`,
          );

          // Send comprehensive completion metrics (non-blocking)
          sendDiscordEmbed({
            title: "Completed Request",
            description: issueContext?.title || contentStr.slice(0, 200) || "(no description)",
            color: 0x00ff00, // Green
            fields: [
              { name: "Issue", value: issueContext?.identifier || "N/A", inline: true },
              { name: "Output", value: `${result.text.length} chars`, inline: true },
              { name: "Model", value: result.providerName, inline: true },
            ],
          }).catch((err) => logDebug(`Discord webhook failed: ${err.message}`));

          const durationMs = Date.now() - startTime;
          recordBridgeMetrics({
            provider: result.providerName,
            durationMs,
            isStream: true,
            isError: false,
          });
          maybeGC();
        } catch (streamError) {
          // Clean up request tracking
          activeRequests.delete(requestId);
          setCurrentRequestId(null);

          clearInterval(heartbeat);
          clearInterval(progressInterval);
          clearTimeout(requestTimeoutHandle);
          logError(
            `Streaming error after ${formatElapsed(Date.now() - startTime)}: ${streamError.message}`,
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
          result = await invokeWithFallback(messages, route, sessionId);
        } finally {
          clearInterval(progressInterval);
          clearTimeout(requestTimeoutHandle);
        }

        const resultText = ensureString(result.text);
        const firstLine = resultText
          ? resultText.split("\n")[0].trim().slice(0, 100)
          : "(no content)";

        // Clean up request tracking
        activeRequests.delete(requestId);
        setCurrentRequestId(null);

        logInfo(`✅ Finished: ${issueContext?.identifier || "Request"} — ${firstLine}`);

        // Send comprehensive completion metrics (non-blocking)
        const tokensIn = result.usage?.promptTokens || 0;
        const tokensOut = result.usage?.completionTokens || 0;
        const totalTokens = tokensIn + tokensOut;

        sendDiscordEmbed({
          title: "Completed Request",
          description: issueContext?.title || contentStr.slice(0, 200) || "(no description)",
          color: 0x00ff00, // Green
          fields: [
            { name: "Issue", value: issueContext?.identifier || "N/A", inline: true },
            {
              name: "Output",
              value: totalTokens > 0 ? `${totalTokens} tokens` : `${resultText.length} chars`,
              inline: true,
            },
            { name: "Model", value: result.providerName, inline: true },
          ],
        }).catch((err) => logDebug(`Discord webhook failed: ${err.message}`));

        const durationMs = Date.now() - startTime;

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
    logError(`Error: ${error.message}`);
    logMemory("request-error");

    // Clean up request tracking on error (only if requestId was defined)
    if (typeof requestId !== "undefined") {
      activeRequests.delete(requestId);
      setCurrentRequestId(null);
    }

    // Prevent ERR_HTTP_HEADERS_SENT crash - don't try to send JSON response
    // if headers have already been sent (e.g., streaming mode with partial response)
    if (res.writableEnded) {
      logError(
        `Cannot send error response - response already ended (stream likely failed mid-flight)`,
      );
      return;
    }

    // Check if headers were sent but response is still writable (streaming with some chunks sent)
    // In this case, try to send an error chunk via the stream instead of JSON
    const headersSent = res.headersSent || res.writableFinished;
    if (headersSent) {
      logError(`Headers already sent - sending error as stream chunk instead of JSON`);
      // Use a fallback model ID since route may not be defined if error occurred early
      const fallbackModelId = typeof route !== "undefined" ? route.responseModelId : MODEL_ID;
      try {
        if (res.writableEnded) {
          logError(`Cannot send error chunk - response already ended`);
          return;
        }
        const errorChunk = {
          id: `chatcmpl-error-${Date.now()}`,
          object: "chat.completion.chunk",
          created: Math.floor(Date.now() / 1000),
          model: fallbackModelId,
          choices: [
            {
              index: 0,
              delta: { content: `\n[Server Error: ${error.message}]` },
              finish_reason: "stop",
            },
          ],
        };
        res.write(`data: ${JSON.stringify(errorChunk)}\n\n`);
        res.write("data: [DONE]\n\n");
        res.end();
        return;
      } catch (streamErr) {
        logError(`Failed to send error chunk: ${streamErr.message}`);
        return;
      }
    }

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

async function shutdown(signal) {
  logInfo(`\nReceived ${signal}, shutting down...`);

  // Update MEMORY.md BEFORE shutdown
  try {
    const commitHash = execSync("git rev-parse --short HEAD", {
      encoding: "utf-8",
      cwd: process.cwd(),
    }).trim();
    const available = providerStatusCache.probeResults.filter((r) => r.available).length;
    const total = providerStatusCache.configured.length;
    await updateMemory(
      `Symphony Bridge stopped (PID ${process.pid}, commit ${commitHash}, ${available}/${total} providers, signal: ${signal})`,
    );
    logInfo(`📝 Updated MEMORY.md before shutdown`);
  } catch (err) {
    logError(`⚠️ Failed to update MEMORY.md on shutdown: ${err.message}`);
  }

  // No cleanup needed - setTimeout will be cleared on process exit
  stopDiscordMonitoring();
  stopProcessingStatusUpdates();
  logProviderStats();
  server.close(() => {
    logInfo("Server closed");
  });
  // Exit immediately without waiting for active connections
  process.exit(0);
}

process.on("SIGTERM", () => {
  shutdown("SIGTERM").catch(() => process.exit(1));
});
process.on("SIGINT", () => {
  shutdown("SIGINT").catch(() => process.exit(1));
});

// -------------------------------------------------------------------------->
// Start server
// --------------------------------------------------------------------------<

// Disable default 2-minute server timeout for long-running SSE streams
server.timeout = 0;
server.keepAliveTimeout = 0;

server.listen(PORT, "127.0.0.1", async () => {
  logInfo(`========================================`);
  logInfo(`Symphony OpenAI Bridge Starting`);
  logInfo(`========================================`);
  logInfo(`Listening: http://127.0.0.1:${PORT}/v1`);
  logInfo(`Model: ${MODEL_ID}`);
  logInfo(`Auth token: Bearer ${API_KEY.slice(0, 10)}...`);
  logInfo(`Streaming: enabled`);
  logInfo(`Auto-fallback: enabled (credit-gate)`);
  logInfo(`Tools available: ${Object.keys(tools).join(", ")}`);
  logInfo(`========================================`);

  // Send immediate Discord notification on startup - BEFORE async probe
  try {
    const commitHash = execSync("git rev-parse --short HEAD", {
      encoding: "utf-8",
      cwd: process.cwd(),
    }).trim();
    const commitInfo = execSync('git log -1 --pretty=format:"%s%n%b"', {
      encoding: "utf-8",
      cwd: process.cwd(),
    }).trim();
    const [commitSubject, ...commitBodyLines] = commitInfo.split("\n");
    const commitBody = commitBodyLines.join("\n").trim();

    logInfo(
      `📢 Sending Discord startup notification (PID ${process.pid}, commit ${commitHash})...`,
    );

    const fields = [
      { name: "Port", value: String(PORT), inline: true },
      { name: "Model", value: MODEL_ID, inline: true },
      { name: "Commit", value: `${commitHash}: ${commitSubject}`, inline: false },
    ];

    // Add commit body if present (truncate to Discord field limit of 1024 chars)
    if (commitBody && commitBody.length > 0) {
      const truncatedBody =
        commitBody.length > 1000 ? commitBody.slice(0, 997) + "..." : commitBody;
      fields.push({ name: "Details", value: truncatedBody, inline: false });
    }

    const discordResult = await sendDiscordEmbed({
      title: "🚀 Symphony Bridge Started",
      description: `PID ${process.pid}`,
      color: 0x00ff00, // Green
      fields,
    });
    if (discordResult.sent) {
      logInfo(`✅ Discord startup notification sent successfully`);
    } else {
      logError(`❌ Discord startup notification failed: ${discordResult.reason || "unknown"}`);
    }
  } catch (err) {
    logError(`❌ Failed to send Discord startup notification: ${err.message}`);
  }

  // Synchronously populate configured providers (no network calls)
  const excludeNames = [...BRIDGE_PROVIDER_BLOCKLIST];
  providerStatusCache.configured = getConfiguredProviders({ excludeNames });
  logInfo(
    `Configured providers (${providerStatusCache.configured.length}): ${providerStatusCache.configured.map((p) => p.name).join(", ")}`,
  );
  if (BRIDGE_PROVIDER_BLOCKLIST.size > 0) {
    logInfo(`⛔ Blocked providers (${BRIDGE_PROVIDER_BLOCKLIST.size}):`);
    for (const name of BRIDGE_PROVIDER_BLOCKLIST) {
      const reason = BRIDGE_PROVIDER_BLOCKLIST_REASONS[name] || "blocklisted";
      logInfo(`  ⛔ ${name}: ${reason}`);
    }
  }

  // Initial provider probe — test all providers for live availability
  refreshProviderStatus()
    .then(async () => {
      const available = providerStatusCache.probeResults.filter((r) => r.available);
      const total = providerStatusCache.configured.length;
      logInfo(`========================================`);
      logInfo(`Startup probe complete: ${available.length}/${total} providers available`);
      for (const p of providerStatusCache.probeResults.filter((r) => r.status !== "excluded")) {
        const icon = p.available ? "✅" : "❌";
        const dur = p.durationMs > 0 ? ` (${p.durationMs}ms)` : "";
        logInfo(`  ${icon} ${p.name}: ${p.status}${dur}`);
      }
      if (nonToolCapableProviders.size > 0) {
        logInfo(
          `🚫 Non-tool-capable (excluded from selection): ${[...nonToolCapableProviders].join(", ")}`,
        );
      }
      const unclassified = available
        .map((r) => r.name)
        .filter((n) => !toolCapableProviders.has(n) && !nonToolCapableProviders.has(n));
      if (unclassified.length > 0) {
        logInfo(
          `❓ Unclassified (${unclassified.length}, left in pool): ${unclassified.join(", ")}`,
        );
      }
      logInfo(
        `✅ Tool-capable: ${toolCapableProviders.size} | 🚫 Excluded: ${nonToolCapableProviders.size} | ❓ Unclassified: ${unclassified.length} | ⛔ Blocked: ${BRIDGE_PROVIDER_BLOCKLIST.size}`,
      );
      logInfo(`========================================`);
      logInfo(`Ready to accept requests`);
      logInfo(`========================================`);

      // Update MEMORY.md with successful startup
      try {
        const commitHash = execSync("git rev-parse --short HEAD", {
          encoding: "utf-8",
          cwd: process.cwd(),
        }).trim();
        await updateMemory(
          `Symphony Bridge restarted successfully (PID ${process.pid}, commit ${commitHash}, ${available.length}/${total} providers available, Discord monitoring ${process.env.DISCORD_BOT_TOKEN ? "active" : "disabled"})`,
        );
      } catch (err) {
        logWarn(`⚠️ Failed to update MEMORY.md: ${err.message}`);
      }
    })
    .catch((err) => {
      logError(`Startup probe failed: ${err.message}`);
      logInfo(`========================================`);
      logInfo(`Ready to accept requests (probe incomplete)`);
      logInfo(`========================================`);
    });

  // Continuous background probe — runs in parallel, updates status continuously
  // Trigger probe cycle after each completion or every 30 minutes
  const scheduleContinuousProbe = (delayMs = PROBE_CYCLE_INTERVAL_MS) => {
    setTimeout(() => {
      runContinuousProviderProbe()
        .catch((err) => {
          logError(`Continuous probe failed: ${err.message}`);
        })
        .finally(() => {
          // Schedule next probe cycle (full 30min interval)
          scheduleContinuousProbe();
        });
    }, delayMs);
  };

  // Start continuous probe 5 minutes after startup (gives time for initial requests)
  scheduleContinuousProbe(5 * 60 * 1000);

  // Start Discord message monitoring
  startDiscordMonitoring();

  // Start periodic processing status updates
  startProcessingStatusUpdates();
});

// Export for testing
export { invokeWithFallback, invokeWithFallbackStream, MODEL_ID, tools };
