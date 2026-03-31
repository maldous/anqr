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

// MUST be first import — sets process.setMaxListeners(0) before other modules
// register signal handlers, preventing MaxListenersExceededWarning at startup.
import "./_set-max-listeners.mjs";
import http from "node:http";
import { AsyncLocalStorage } from "node:async_hooks";
import path from "node:path";
import fs from "node:fs";
import { execSync, execFileSync } from "node:child_process";
import { createLogger } from "../../lib/logger.mjs";

const { logDebug, logInfo, logWarn, logError } = createLogger();
import {
  selectProvider,
  recordProviderSelection,
  recordProviderFailure,
  recordProviderFailureCount,
  recordProviderMetrics,
  recordProviderSuccess,
  recordProbeResult,
  getProviderStats,
  getRankedProviders,
  logProviderStats,
  resetProviderStats,
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
  setSessionMessages,
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
import {
  truncateMessagesForProvider,
  estimateMessagesTokens,
} from "./symphony-bridge-truncation.mjs";

// Adaptive context management (dynamic limits, TPM/RPM tracking, error classification)
import {
  getEffectiveMaxTokens,
  recordContextError,
  recordContextSuccess,
  recordRateLimit,
  recordTokenUsage,
  recordErrorType,
  classifyError,
  getThrottledProviders,
  getAdaptiveStats,
  parseContextErrorDetails,
  parseRateLimitInfo,
  shouldReduceContextForTPM,
  ERROR_TYPES,
} from "./symphony-adaptive-context.mjs";

const CODEX_SANDBOX_MODE = process.env.CODEX_SANDBOX_MODE || "danger-full-access";

// Discord webhook notifications
import {
  streamDiscordUpdate,
  flushDiscordStream,
  sendDiscordEmbed,
} from "../notifications/discord-webhook.mjs";

// MEMORY.md updates for persistence across restarts
import { updateMemory } from "../../lib/update-memory.mjs";
import { inferSymphonyResultFromCompletion } from "../../runtime/symphony/bridge-result.mjs";

// Enhancement 1: Context7 documentation via HTTP service (port 4320)
const CONTEXT7_HTTP_BASE = process.env.CONTEXT7_HTTP_URL || "http://127.0.0.1:4320";

// Enhancement 3: Hybrid search (BM25 + embeddings) for find_files
import {
  searchFiles as hybridSearchFiles,
  getSearchStats as getHybridSearchStats,
  warmSearchIndex,
} from "../../lib/search/hybrid-search.mjs";
import { getLinearIndexStats, searchLinearIssues, warmLinearIndex } from "../../lib/search/linear-search.mjs";
import { getIndexStats as getVectorIndexStats } from "../../lib/rag/vector-store.mjs";

// Discord message monitoring (listen for user input from Discord text channel)
let lastDiscordMessageId = null;
let discordMonitorInterval = null;

// Discord channel IDs (from environment or fallback defaults)
const DISCORD_TEXT_CHANNEL_ID = process.env.DISCORD_TEXT_CHANNEL_ID || "1486262758256410646";
// Voice channel ID passed to OpenClaw for voice announcements
const DISCORD_VOICE_CHANNEL_ID = process.env.DISCORD_VOICE_CHANNEL_ID || "1486262758256410647";
logDebug(`Discord channels: text=${DISCORD_TEXT_CHANNEL_ID}, voice=${DISCORD_VOICE_CHANNEL_ID}`);

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
  // CRITICAL FIX (ANQ-XXXX): Disable Discord monitoring on ALL Symphony bridges (main and worktrees).
  // Only the OpenClaw Gateway (port 18789) and Discord Router (port 18790) should listen for Discord messages.
  // This prevents duplicate request flooding when multiple bridges poll Discord.
  //
  // Root cause: When Discord monitoring is enabled on multiple bridges, each poll triggers a request.
  // The main bridge (4319) plus 4 worktree bridges (4325-4328) = 5 potential duplicates per message.
  // Even with worktree bridges disabled, the main bridge still duplicates requests to itself.
  //
  // Correct flow: Discord Bot → OpenClaw Gateway (18789) → Discord Router (18790) → Worktree Bridges (4325-4328)
  // The main Symphony bridge (4319) handles only queue/Linear automation, not Discord commands.
  if (process.env.ANQR_WORKTREE_ID || PORT === 4319) {
    // Main bridge (4319) should not monitor Discord - let OpenClaw Gateway handle Discord interaction
    // Worktree bridges already have ANQR_WORKTREE_ID set, skip them too
    const bridgeId = process.env.ANQR_WORKTREE_ID || `main-bridge`;
    logInfo(`⚠️ Discord monitoring DISABLED on ${bridgeId} (port ${PORT}) - OpenClaw Gateway handles Discord`);
    logInfo(`   Flow: Discord Bot → OpenClaw Gateway (18789) → Discord Router (18790) → Worktree Bridges`);
    return;
  }

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

      // Process the command via Symphony bridge (Discord streaming handled in SSE consumption loop below)
      try {
        if (!message.id) {
          logWarn(`⚠️ Discord command skipped: invalid message object`);
          return;
        }

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

        // Consume the SSE stream and forward text chunks to Discord via streamDiscordUpdate
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
                if (content && content.trim().length > 0) {
                  // Filter out internal activity markers that the AI SDK includes in result.text
                  // These would duplicate what we already log via DEBUG
                  const isActivityMarker = /^🔧\s+\w+:?\s*$|^✅\s+\w+\s+done\s*$/;
                  // Filter out standalone light bulb emoji from Discord notifications
                  const trimmed = content.trim();
                  const isLightbulb = trimmed === "💡" || content === "\n💡 " || content === "💡 ";
                  if (!isActivityMarker.test(trimmed) && !isLightbulb) {
                    fullText += content;
                    // Use safe requestId in case message became undefined during stream processing
                    const streamRequestId = message?.id ? `discord-cmd-${message.id}` : `discord-cmd-${Date.now()}`;
                    streamDiscordUpdate(content, {
                      emoji: "",
                      requestId: streamRequestId,
                    }).catch(() => {
                      /* ignore */
                    });
                  }
                }
              } catch {
                // Parse error - ignore malformed JSON chunk
              }
            }
          }
        } finally {
          reader.releaseLock();
        }

        // Flush any remaining buffered text to Discord
        // Use a safe requestId even if message.id is undefined
        const safeRequestId = message?.id ? `discord-cmd-${message.id}` : `discord-cmd-${Date.now()}`;
        await flushDiscordStream({ emoji: "", requestId: safeRequestId }).catch(
          () => {
            /* ignore */
          },
        );

        logInfo(`✅ Discord command processed: ${fullText.slice(0, 100)}`);
      } catch (err) {
        // Flush buffer on error too so partial text reaches Discord (use safe requestId)
        const safeRequestId = message?.id ? `discord-cmd-${message.id}` : `discord-cmd-${Date.now()}`;
        await flushDiscordStream({ emoji: "", requestId: safeRequestId }).catch(
          () => {
            /* ignore */
          },
        );
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
 * Shows all concurrent requests with brief summaries
 */
async function sendProcessingStatusUpdate() {
  if (activeRequests.size === 0) return;

  const now = Date.now();
  const summaries = [];

  // Build brief one-line summaries for each active request
  for (const [reqId, req] of activeRequests.entries()) {
    const runtime = formatElapsed(now - req.startTime);
    const filesChanged = req.filesChanged || 0;
    const issueLabel = req.issueId || reqId;
    const worktreeLabel = req.worktreeId ? ` [${req.worktreeId}]` : "";

    // Create brief summary: "ANQ-123 [wt5] (2.5min, 3 files)"
    const filesSuffix = filesChanged > 0 ? ", " + filesChanged + " files" : "";
    const summary = issueLabel + worktreeLabel + " (" + runtime + filesSuffix + ")";
    summaries.push(summary);
  }

  // Combine all summaries into a single description
  const description = summaries.join("\n");

  // Clear messaging: show total active requests (0 active = idle state)
  await sendDiscordEmbed({
    title: `⏳ Processing — ${activeRequests.size} active ${activeRequests.size === 1 ? "request" : "requests"}`,
    description,
    color: 0x3498db, // Blue
    fields: [], // No fields - all info in description for simplicity
  }).catch((err) => safeLogDebug(`Processing status update failed: ${err.message}`));
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


const requestCwdStorage = new AsyncLocalStorage();
const BRIDGE_ROOT = path.resolve(process.env.ANQR_WORKTREE_PATH || process.cwd());
const BRIDGE_PARENT_ROOT = path.dirname(BRIDGE_ROOT);
const IS_WORKTREE_BRIDGE = Boolean(process.env.ANQR_WORKTREE_ID || process.env.ANQR_WORKTREE_PATH);
const WORKTREE_CHECKOUT_PATTERN = /^(anqr|anqr-wt\d+)$/;

function isPathWithinRoot(candidatePath, rootPath) {
  if (!candidatePath || !rootPath) return false;
  const relative = path.relative(rootPath, candidatePath);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function detectControlRepoRoot() {
  const gitPointerPath = path.join(BRIDGE_ROOT, ".git");
  try {
    const stat = fs.statSync(gitPointerPath);
    if (!stat.isFile()) return BRIDGE_ROOT;
    const gitPointer = fs.readFileSync(gitPointerPath, "utf8");
    const match = gitPointer.match(/gitdir:\s*(.+)/);
    if (!match || !match[1]) return BRIDGE_ROOT;
    const gitDir = path.resolve(BRIDGE_ROOT, match[1].trim());
    const marker = `${path.sep}.git${path.sep}worktrees${path.sep}`;
    const markerIndex = gitDir.lastIndexOf(marker);
    if (markerIndex === -1) return BRIDGE_ROOT;
    return gitDir.slice(0, markerIndex);
  } catch {
    return BRIDGE_ROOT;
  }
}

const CONTROL_REPO_ROOT = detectControlRepoRoot();

function remapRepoPathToBridgeRoot(candidatePath) {
  if (!IS_WORKTREE_BRIDGE) return candidatePath;
  if (isPathWithinRoot(candidatePath, BRIDGE_ROOT)) return candidatePath;

  if (isPathWithinRoot(candidatePath, CONTROL_REPO_ROOT)) {
    const relative = path.relative(CONTROL_REPO_ROOT, candidatePath);
    return path.resolve(BRIDGE_ROOT, relative);
  }

  if (isPathWithinRoot(candidatePath, BRIDGE_PARENT_ROOT)) {
    const relative = path.relative(BRIDGE_PARENT_ROOT, candidatePath);
    const segments = relative.split(path.sep).filter(Boolean);
    if (segments.length > 0 && WORKTREE_CHECKOUT_PATTERN.test(segments[0])) {
      return path.resolve(BRIDGE_ROOT, ...segments.slice(1));
    }
  }

  return BRIDGE_ROOT;
}

function normalizeRequestCwd(cwd) {
  if (typeof cwd !== "string") return remapRepoPathToBridgeRoot(BRIDGE_ROOT);
  const trimmed = cwd.trim();
  if (!trimmed) return remapRepoPathToBridgeRoot(BRIDGE_ROOT);
  return remapRepoPathToBridgeRoot(path.resolve(trimmed));
}

function withRequestCwd(cwd, fn) {
  return requestCwdStorage.run({ cwd: normalizeRequestCwd(cwd) }, fn);
}

function getCurrentRequestCwd() {
  return requestCwdStorage.getStore()?.cwd || normalizeRequestCwd(BRIDGE_ROOT);
}

function resolveRequestPath(targetPath) {
  if (typeof targetPath !== "string") return targetPath;
  const trimmed = targetPath.trim();
  if (!trimmed) return getCurrentRequestCwd();
  const resolvedPath = path.isAbsolute(trimmed)
    ? path.resolve(trimmed)
    : path.resolve(getCurrentRequestCwd(), trimmed);
  return remapRepoPathToBridgeRoot(resolvedPath);
}

function resolveRequestDir(cwd) {
  if (typeof cwd !== "string") return getCurrentRequestCwd();
  const trimmed = cwd.trim();
  if (!trimmed) return getCurrentRequestCwd();
  const resolvedDir = path.isAbsolute(trimmed)
    ? path.resolve(trimmed)
    : path.resolve(getCurrentRequestCwd(), trimmed);
  return remapRepoPathToBridgeRoot(resolvedDir);
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
    workingDirectory: normalizeRequestCwd(options.cwd),
    sandboxMode: CODEX_SANDBOX_MODE,
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
        if (event.item.type === "agent_message" && event.item.id) {
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
      cwd: resolveRequestDir(cwd),
      encoding: "utf-8",
      timeout: 60000,
      maxBuffer: 10 * 1024 * 1024, // 10MB
    });
    return { output: result, exitCode: 0 };
  } catch (error) {
    logError(`execTool failed: ${error.message}`, { command: command?.slice(0, 100) });
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

function coerceStringArrayInput(value, { fallback = undefined } = {}) {
  if (Array.isArray(value)) {
    const cleaned = value
      .filter((item) => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
    return cleaned.length > 0 ? cleaned : fallback;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return fallback;
    if (
      (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
      (trimmed.startsWith('"') && trimmed.endsWith('"'))
    ) {
      try {
        return coerceStringArrayInput(JSON.parse(trimmed), { fallback });
      } catch {
        // Fall through and treat as a literal path string.
      }
    }
    return [trimmed];
  }

  if (value && typeof value === "object") {
    if (typeof value.path === "string") return [value.path.trim()].filter(Boolean);
    if (typeof value.paths === "string" || Array.isArray(value.paths)) {
      return coerceStringArrayInput(value.paths, { fallback });
    }
  }

  return fallback;
}

function coerceOptionalNumberInput(value, fallback = undefined) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return fallback;
    const parsed = Number(trimmed);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function calculateTimeoutMs(seconds) {
  // Convert timeout from seconds to milliseconds
  const DEFAULT_SECONDS = 30;
  if (seconds === -1) return undefined; // no timeout
  if (seconds == null) return DEFAULT_SECONDS * 1000;
  return seconds * 1000;
}

function isProbablyBinaryContent(content) {
  return content.includes("\0");
}

/**
 * Read multiple files from the filesystem
 */
async function readFilesTool({ paths }) {
  try {
    const normalizedPaths = coerceStringArrayInput(paths, { fallback: [] }) || [];
    if (normalizedPaths.length === 0) {
      return { error: "invalid_paths_payload: paths must contain at least one file path" };
    }

    const results = normalizedPaths.map((filePath) => {
      try {
        const content = fs.readFileSync(resolveRequestPath(filePath), "utf-8");
        const totalLines = content.split("\n").length;
        return { path: filePath, content, totalLines };
    } catch (error) {
      logError(`readFilesTool map failed: ${error.message}`, { path: filePath });
      return { path: filePath, error: error.message };
    }
  });
  return { files: results };
} catch (error) {
  logError(`readFilesTool failed: ${error.message}`);
  return { error: error.message };
}
}

/**
 * Read a file from the filesystem
 */
async function readFileTool({ path: filePath, offset, lines }) {
  try {
    let content = fs.readFileSync(resolveRequestPath(filePath), "utf-8");
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
    logError(`readFileTool failed: ${error.message}`, { path });
    return { error: error.message };
  }
}

/**
 * String replace in a file
 */
async function strReplaceTool({ path: filePath, replacements }) {
  try {
    let content = fs.readFileSync(resolveRequestPath(filePath), "utf-8");

    // Defensive normalization (workaround for SDK bug sending string instead of array)
    const replacementsList = Array.isArray(replacements) ? replacements : [replacements];

    if (replacementsList.length === 0) {
      return {
        error: "invalid_replacements_payload: replacements array is empty — no changes made",
      };
    }

    for (const { old, new: newStr, allowMultiple } of replacementsList) {
      if (allowMultiple) {
        content = content.split(old).join(newStr);
      } else {
        const index = content.indexOf(old);
        if (index === -1) {
          return { error: `String not found in file: ${old.slice(0, 100)}` };
        }
        content = content.slice(0, index) + newStr + content.slice(index + old.length);
      }
    }

    fs.writeFileSync(resolveRequestPath(filePath), content, "utf-8");

    // Track file change for current request
    const reqId = getCurrentRequestId();
    if (reqId) {
      trackFileChange(reqId);
    }

    return { success: true, path: filePath, replacements: replacementsList.length };
  } catch (error) {
    logError(`replaceInFileTool failed: ${error.message}`, { path: filePath });
    return { error: error.message };
  }
}

/**
 * Write a file (wrapper that tracks changes)
 */
async function writeFileTool({ path: filePath, content }) {
  try {
    fs.writeFileSync(resolveRequestPath(filePath), content, "utf-8");

    // Track file change for current request
    const reqId = getCurrentRequestId();
    if (reqId) {
      trackFileChange(reqId);
    }

    return { success: true, path: filePath };
  } catch (error) {
    logError(`writeFileTool failed: ${error.message}`, { path: filePath });
    return { error: error.message };
  }
}

/**
 * Code search using ripgrep
 */
async function codeSearchTool({ pattern, flags, cwd, maxResults = 15 }) {
  try {
    const baseDir = resolveRequestDir(cwd);
    const flagsStr = flags || "";
    const command = `rg "${pattern.replace(/"/g, '\\"')}" ${flagsStr} "${baseDir}" -n --max-count=${maxResults} 2>/dev/null || true`;
    const result = execSync(command, {
      encoding: "utf-8",
      timeout: 10000,
      maxBuffer: 10 * 1024 * 1024,
    });

    const lines = result.split("\n").filter(Boolean);
    const matches = lines.map((line) => {
      const match = line.match(/^([^:]+):(\d+):(.+)$/);
      if (match) {
        return { file: match[1], line: parseInt(match[2]), content: match[3] };
      }
      return { raw: line };
    });

    return { matches, count: matches.length, pattern };
  } catch (error) {
    return { error: error.message, matches: [] };
  }
}

/**
 * List files matching a pattern
 */
async function globTool({ pattern, cwd }) {
  try {
    const baseDir = resolveRequestDir(cwd);
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
    const memoryFile = path.join(getCurrentRequestCwd(), "MEMORY.md");
    const knowledgeFile = path.join(getCurrentRequestCwd(), "knowledge.md");
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
 * List directory contents
 */
async function listDirectoryTool({ path: dirPath }) {
  try {
    const fullPath = resolveRequestPath(dirPath || ".");
    const entries = fs.readdirSync(fullPath, { withFileTypes: true });

    const files = entries.filter((e) => e.isFile()).map((e) => e.name);
    const directories = entries.filter((e) => e.isDirectory()).map((e) => e.name);

    return { files, directories, path: dirPath };
  } catch (error) {
    logError(`listDirectoryTool failed: ${error.message}`, { path: dirPath });
    return { error: error.message };
  }
}

/**
 * Read directory subtree with parsed AST info
 */
async function readSubtreeTool({ paths, maxTokens = 50000 }) {
  try {
    const targetPaths = coerceStringArrayInput(paths, { fallback: ["."] }) || ["."];
    const normalizedMaxTokens = Math.max(
      1000,
      Math.floor(coerceOptionalNumberInput(maxTokens, 50000) || 50000),
    );
    const maxChars = normalizedMaxTokens * 4;
    const result = [];
    let usedChars = 0;
    let truncated = false;

    const pushEntry = (entryPath, content) => {
      if (usedChars >= maxChars) {
        truncated = true;
        return false;
      }

      const remainingChars = maxChars - usedChars;
      let safeContent = content;
      if (safeContent.length > remainingChars) {
        safeContent = safeContent.slice(0, Math.max(0, remainingChars - 16)) + "\n... (truncated)";
        truncated = true;
      }

      usedChars += safeContent.length;
      result.push({ path: entryPath, type: "file", content: safeContent });
      return usedChars < maxChars;
    };

    const walk = (fullPath, relativePath) => {
      if (usedChars >= maxChars) {
        truncated = true;
        return;
      }

      const stats = fs.statSync(fullPath);
      if (stats.isFile()) {
        const content = fs.readFileSync(fullPath, "utf-8");
        if (!isProbablyBinaryContent(content)) {
          pushEntry(relativePath, content);
        }
        return;
      }

      if (!stats.isDirectory()) return;

      const entries = fs.readdirSync(fullPath, { withFileTypes: true });
      for (const entry of entries) {
        if ([".git", "node_modules", "dist", "build", "coverage"].includes(entry.name)) continue;
        const nextFullPath = path.join(fullPath, entry.name);
        const nextRelativePath = path.join(relativePath, entry.name);
        if (entry.isDirectory()) {
          walk(nextFullPath, nextRelativePath);
        } else if (entry.isFile()) {
          const content = fs.readFileSync(nextFullPath, "utf-8");
          if (!isProbablyBinaryContent(content) && !pushEntry(nextRelativePath, content)) return;
        }
        if (usedChars >= maxChars) return;
      }
    };

    for (const targetPath of targetPaths) {
      const fullPath = resolveRequestPath(targetPath);
      walk(fullPath, targetPath);
      if (usedChars >= maxChars) break;
    }

    return { entries: result, count: result.length, truncated, maxTokens: normalizedMaxTokens };
  } catch (error) {
    logError(`readSubtreeTool failed: ${error.message}`, { paths });
    return { error: error.message };
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

    const filePath = path.join(getCurrentRequestCwd(), fileName);

    if (!fs.existsSync(filePath)) {
      return { error: `File ${fileName} not found`, content: "" };
    }

    const content = fs.readFileSync(resolveRequestPath(filePath), "utf-8");
    return { content, file: fileName, lines: content.split("\n").length };
  } catch (error) {
    logError(`memoryGetTool failed: ${error.message}`, { file });
    return { error: error.message };
  }
}

/**
 * Execute file change hooks
 */
async function runFileChangeHooksTool({ files }) {
  try {
    // files is already normalized to array by the schema transform
    // If no files provided, return early with success
    if (!files || files.length === 0) {
      return { success: true, message: "No files to process" };
    }

    // Check if codebuff.json has fileChangeHooks configured
    const codebuffConfigPath = path.join(getCurrentRequestCwd(), "codebuff.json");
    let hooks = [];

    if (fs.existsSync(codebuffConfigPath)) {
      const config = JSON.parse(fs.readFileSync(codebuffConfigPath, "utf-8"));
      hooks = config.fileChangeHooks || [];
    }

    if (hooks.length === 0) {
      return { success: true, message: "No file change hooks configured" };
    }

    const results = [];
    for (const hook of hooks) {
      try {
        const command = hook.replace("{files}", files.join(" "));
        const result = execSync(command, {
          cwd: getCurrentRequestCwd(),
          encoding: "utf-8",
          timeout: 60000,
          maxBuffer: 10 * 1024 * 1024,
        });
        results.push({ hook, success: true, output: result });
      } catch (err) {
        results.push({ hook, success: false, error: err.message });
      }
    }

    return { success: true, results };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Think deeply about a problem
 */
async function thinkDeeplyTool({ thought }) {
  // Log the thinking for observability
  logInfo(`💭 Deep thinking: ${thought.slice(0, 200)}`);
  return { acknowledged: true, thought };
}

/**
 * Update a subgoal (track progress)
 */
async function updateSubgoalTool({ id, status, log, plan }) {
  const logSuffix = log ? " - " + log.slice(0, 100) : "";
  logInfo(`📋 Subgoal ${id}: ${status || "update"}${logSuffix}`);
  return {
    acknowledged: true,
    id,
    status: status || "IN_PROGRESS",
    log,
    plan,
  };
}

/**
 * Spawn agents to run in parallel
 */
async function spawnAgentsTool({ agents }) {
  // Symphony bridge doesn't support spawning sub-agents
  // Log the request and return acknowledgment
  logInfo(`🤖 Agent spawn requested: ${agents.map((a) => a.agent_type).join(", ")}`);
  return {
    acknowledged: true,
    message: "Agent spawning is handled by the parent Codebuff/OpenClaw instance",
    agents: agents.map((a) => ({ type: a.agent_type, status: "delegated" })),
  };
}

/**
 * Propose string replacements without applying them
 */
async function proposeStrReplaceTool({ path: filePath, replacements }) {
  try {
    const content = fs.readFileSync(resolveRequestPath(filePath), "utf-8");
    const proposed = [];

    // Defensive normalization (workaround for SDK bug sending string instead of array)
    const replacementsList = Array.isArray(replacements) ? replacements : [replacements];

    if (replacementsList.length === 0) {
      return { error: "invalid_replacements_payload: replacements array is empty" };
    }

    for (const { old, new: newStr } of replacementsList) {
      const index = content.indexOf(old);
      proposed.push({
        old: old.slice(0, 100),
        new: newStr.slice(0, 100),
        found: index !== -1,
      });
    }

    return { success: true, path: filePath, proposed };
  } catch (error) {
    logError(`proposeStrReplaceTool failed: ${error.message}`, { path: filePath });
    return { error: error.message };
  }
}

/**
 * Propose write file without applying
 */
async function proposeWriteFileTool({ path: filePath, instructions, content }) {
  logInfo(`📝 Proposed write: ${filePath} - ${instructions}`);
  return {
    success: true,
    path: filePath,
    instructions,
    contentLength: content.length,
    proposed: true,
  };
}

/**
 * Add a message to conversation
 */
async function addMessageTool({ role, content }) {
  logInfo(`💬 Add message: ${role} - ${content.slice(0, 100)}`);
  return { acknowledged: true, role, contentLength: content.length };
}

/**
 * Set messages in conversation
 */
async function setMessagesTool({ messages }) {
  logInfo(`💬 Set messages: ${messages.length} messages`);
  return { acknowledged: true, count: messages.length };
}

/**
 * Set output for spawned agent
 */
async function setOutputTool(output) {
  logInfo(`📤 Set output: ${JSON.stringify(output).slice(0, 100)}`);
  return { acknowledged: true };
}

/**
 * Load a skill
 */
async function skillTool({ name }) {
  logInfo(`📚 Load skill: ${name}`);
  return {
    acknowledged: true,
    skill: name,
    message: "Skill loading is handled by the parent instance",
  };
}

/**
 * Suggest followup prompts
 */
async function suggestFollowupsTool({ followups }) {
  logInfo(`💡 Suggest followups: ${followups.length} items`);
  return { acknowledged: true, count: followups.length };
}

/**
 * Signal task completion
 */
async function taskCompletedTool() {
  logInfo(`✅ Task completed`);
  return { acknowledged: true, completed: true };
}

/**
 * Write todos list
 */
async function writeTodosTool({ todos }) {
  logInfo(`📋 Write todos: ${todos.length} items`);
  return { acknowledged: true, count: todos.length, todos };
}

/**
 * Apply patch (Codex-style)
 */
async function applyPatchTool({ operation }) {
  try {
    const { type, path: filePath, diff } = operation;

    if (type === "create_file") {
      if (!diff) return { error: "diff required for create_file" };
      const lines = diff
        .split("\n")
        .filter((l) => l.startsWith("+"))
        .map((l) => l.slice(1));
      const content = lines.join("\n");
      fs.writeFileSync(resolveRequestPath(filePath), content, "utf-8");

      const reqId = getCurrentRequestId();
      if (reqId) trackFileChange(reqId);

      return { success: true, operation: "create", path: filePath };
    } else if (type === "update_file") {
      if (!diff) return { error: "diff required for update_file" };
      // Simplified: treat as full content replacement
      const lines = diff
        .split("\n")
        .filter((l) => l.startsWith("+"))
        .map((l) => l.slice(1));
      const content = lines.join("\n");
      fs.writeFileSync(resolveRequestPath(filePath), content, "utf-8");

      const reqId = getCurrentRequestId();
      if (reqId) trackFileChange(reqId);

      return { success: true, operation: "update", path: filePath };
    } else if (type === "delete_file") {
      fs.unlinkSync(resolveRequestPath(filePath));
      return { success: true, operation: "delete", path: filePath };
    }

    return { error: `Unknown operation type: ${type}` };
  } catch (error) {
    logError(`executeFileChangeHooksTool failed: ${error.message}`);
    return { error: error.message };
  }
}

/**
 * Ask user questions (not supported in Symphony bridge)
 */
async function askUserTool({ questions }) {
  logInfo(`❓ Ask user: ${questions.length} questions`);
  return {
    acknowledged: true,
    message: "User interaction is handled by the parent Codebuff/OpenClaw instance",
    questions: questions.length,
  };
}

/**
 * Lookup agent info
 */
async function lookupAgentInfoTool({ agentId }) {
  logInfo(`🔍 Lookup agent: ${agentId}`);
  return {
    acknowledged: true,
    agentId,
    message: "Agent lookup is handled by the parent instance",
  };
}

/**
 * Add a new subgoal
 */
async function addSubgoalTool({ id, objective, status, log, plan }) {
  logInfo(`🎯 New subgoal ${id}: ${objective.slice(0, 100)}`);
  return {
    acknowledged: true,
    id,
    objective,
    status: status || "NOT_STARTED",
    log,
    plan,
  };
}

/**
 * Find files using hybrid search (BM25 + semantic embeddings via Ollama)
 * Falls back to basic glob-based search if hybrid search is unavailable.
 */
async function findFilesTool({ prompt }) {
  try {
    logInfo(`🔍 Finding files: ${prompt.slice(0, 100)}`);

    // Attempt hybrid search (BM25 + optional embedding re-ranking)
    try {
      const result = await hybridSearchFiles(prompt, {
        rootDir: getCurrentRequestCwd(),
        topK: 20,
        useEmbeddings: true,
      });

      if (result.files.length > 0) {
        logInfo(
          `📊 Hybrid search (${result.method}): ${result.count} results for "${prompt.slice(0, 60)}"`,
        );
        return {
          files: result.files,
          count: result.count,
          query: prompt.slice(0, 100),
          method: result.method,
        };
      }
    } catch (err) {
      logWarn(`Hybrid search failed, falling back to basic: ${err.message}`);
    }

    // Fallback: basic glob-based search
    const searchTerms = prompt
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length > 2);
    const extensions = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".json", ".md"];

    const results = [];
    for (const ext of extensions) {
      try {
        const cmd = `find . -type f -name "*${ext}" -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null | head -50`;
        const output = execSync(cmd, {
          cwd: getCurrentRequestCwd(),
          encoding: "utf-8",
          timeout: 5000,
        });
        const files = output.split("\n").filter(Boolean);

        for (const file of files) {
          const lowerPath = file.toLowerCase();
          const score = searchTerms.reduce(
            (sum, term) => sum + (lowerPath.includes(term) ? 1 : 0),
            0,
          );
          if (score > 0) {
            results.push({ path: file.replace(/^\.\//, ""), score });
          }
        }
      } catch {
        /* ignore */
      }
    }

    const sorted = results.sort((a, b) => b.score - a.score).slice(0, 20);
    const paths = sorted.map((r) => r.path);

    return {
      files: paths,
      count: paths.length,
      query: prompt.slice(0, 100),
      method: "basic",
    };
  } catch (error) {
    return { error: error.message, files: [] };
  }
}

/**
 * Web search using external API
 */
async function webSearchTool({ query, depth = "standard" }) {
  try {
    logInfo(`🌐 Web search: ${query.slice(0, 100)} (${depth})`);

    // Check for Linkup API key or other web search API
    const apiKey = process.env.LINKUP_API_KEY || process.env.WEB_SEARCH_API_KEY;

    if (!apiKey) {
      return {
        error: "Web search requires LINKUP_API_KEY or WEB_SEARCH_API_KEY environment variable",
        results: [],
        message: "Web search is not configured. Set LINKUP_API_KEY to enable this feature.",
      };
    }

    // Call Linkup API or similar web search service
    const response = await fetch("https://api.linkup.so/v1/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        depth,
        outputType: "searchResults",
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      logError(`Web search API returned ${response.status}`);
      throw new Error(`Web search API returned ${response.status}`);
    }

    const data = await response.json();
    return {
      results: data.results || [],
      count: data.results?.length || 0,
      query,
    };
  } catch (error) {
    logWarn(`Web search failed: ${error.message}`);
    return {
      error: error.message,
      results: [],
      message: "Web search is currently unavailable",
    };
  }
}

/**
 * Read library documentation via local Context7 MCP server with cloud API fallback
 */
async function readDocsTool({ libraryTitle, topic, max_tokens = 20000 }) {
  try {
    logInfo(`📚 Reading docs: ${libraryTitle} - ${topic}`);

    const effectiveMaxTokens = Math.max(max_tokens, 10000);

    // Attempt 1: Context7 HTTP service (dedicated systemd service on port 4320)
    try {
      const httpRes = await fetch(`${CONTEXT7_HTTP_BASE}/v1/resolve-docs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ libraryTitle, topic, max_tokens: effectiveMaxTokens }),
        signal: AbortSignal.timeout(35000),
      });

      if (httpRes.ok) {
        const result = await httpRes.json();
        if (result.documentation) {
          logInfo(`📚 Docs resolved via ${result.source} for "${libraryTitle}"`);
          return {
            content: result.documentation,
            library: libraryTitle,
            topic,
            source: result.source,
            tokens: Math.ceil(result.documentation.length / 4),
          };
        }
      } else {
        logWarn(`Context7 HTTP service returned ${httpRes.status}`);
      }
    } catch (err) {
      logWarn(`Context7 HTTP service unavailable: ${err.message}`);
    }

    // Attempt 2: Direct Context7 cloud API (legacy fallback)
    const apiKey = process.env.CONTEXT7_API_KEY || process.env.DOCS_API_KEY;

    if (!apiKey) {
      return {
        error:
          "Documentation reading requires CONTEXT7_API_KEY or DOCS_API_KEY environment variable",
        content: "",
        message:
          "Documentation API is not configured. Set CONTEXT7_API_KEY to enable this feature.",
      };
    }

    const response = await fetch("https://api.context7.com/v1/docs", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        library: libraryTitle,
        topic,
        max_tokens: effectiveMaxTokens,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      logError(`Context7 API returned ${response.status}`);
      throw new Error(`Context7 API returned ${response.status}`);
    }

    const data = await response.json();
    return {
      content: data.content || "",
      library: libraryTitle,
      topic,
      source: "cloud-direct",
      tokens: data.tokens || 0,
    };
  } catch (error) {
    logWarn(`Documentation reading failed: ${error.message}`);
    return {
      error: error.message,
      content: "",
      message: "Documentation API is currently unavailable",
    };
  }
}

async function searchLinearIssuesTool({ query, limit = 5 }) {
  try {
    const results = await searchLinearIssues(query, limit);
    return {
      query,
      count: results.length,
      results,
      index: getLinearIndexStats(),
    };
  } catch (err) {
    return {
      query,
      count: 0,
      results: [],
      error: err?.message || String(err),
      index: getLinearIndexStats(),
    };
  }
}

// Available tools for the AI SDK
const tools = {
  code_search: tool({
    description: "Search for string patterns in the project's files using ripgrep",
    inputSchema: z.object({
      pattern: z.string().describe("The pattern to search for"),
      flags: z.string().optional().describe("Optional ripgrep flags"),
      cwd: z.string().optional().describe("Working directory to search within"),
      maxResults: z.number().optional().describe("Maximum results per file (default 15)"),
    }),
    execute: codeSearchTool,
  }),
  read_files: tool({
    description: "Read multiple files from the filesystem",
    inputSchema: z.object({
      paths: z.preprocess((val) => coerceStringArrayInput(val, { fallback: [] }), z.array(z.string()).describe("List of file paths to read (accepts string or array)")),
    }),
    execute: readFilesTool,
  }),
  str_replace: tool({
    description: "Replace strings in a file with new strings",
    inputSchema: z.object({
      path: z.string().describe("Path to the file to edit"),
      replacements: z.preprocess(
        (val) => {
          if (Array.isArray(val)) return val;
          if (typeof val === "string") {
            const trimmed = val.trim();
            if (!trimmed) return [];
            if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
              try {
                const parsed = JSON.parse(trimmed);
                return Array.isArray(parsed) ? parsed : [parsed];
              } catch {
                return [];
              }
            }
            try {
              const parsed = JSON.parse(trimmed);
              return Array.isArray(parsed) ? parsed : [parsed];
            } catch {
              return [];
            }
          }
          if (val && typeof val === "object") return [val];
          return [];
        },
        z.array(
          z.object({
            old: z.string().describe("String to replace"),
            new: z.string().describe("Replacement string"),
            allowMultiple: z.boolean().optional().describe("Allow multiple replacements"),
          }),
        ),
      ),
    }),
    execute: strReplaceTool,
  }),
  list_directory: tool({
    description: "List files and directories in a path",
    inputSchema: z.object({
      path: z.string().describe("Directory path to list"),
    }),
    execute: listDirectoryTool,
  }),
  read_subtree: tool({
    description: "Read directory subtree with file contents",
    inputSchema: z.object({
      paths: z.preprocess(
        (val) => coerceStringArrayInput(val, { fallback: ["."] }),
        z
          .array(z.string())
          .optional()
          .describe("Paths to read (default: ['.']; accepts string or array)"),
      ),
      maxTokens: z.preprocess(
        (val) => coerceOptionalNumberInput(val, undefined),
        z
          .number()
          .int()
          .positive()
          .optional()
          .describe("Maximum token budget (default: 50000; accepts numeric string)"),
      ),
    }),
    execute: readSubtreeTool,
  }),
  spawn_agents: tool({
    description: "Spawn multiple agents to run in parallel",
    inputSchema: z.object({
      agents: z.preprocess(
        (val) => {
          if (Array.isArray(val)) return val;
          if (typeof val === "string") {
            const trimmed = val.trim();
            if (!trimmed) return [];
            try {
              const parsed = JSON.parse(trimmed);
              return Array.isArray(parsed) ? parsed : [parsed];
            } catch {
              return [];
            }
          }
          if (val && typeof val === "object") return [val];
          return [];
        },
        z.array(
          z.object({
            agent_type: z.string().describe("Agent to spawn"),
            prompt: z.string().optional().describe("Prompt to send"),
            params: z.record(z.any()).optional().describe("Parameters object"),
          }),
        ),
      ),
    }),
    execute: spawnAgentsTool,
  }),
  propose_str_replace: tool({
    description: "Propose string replacements without applying them",
    inputSchema: z.object({
      path: z.string().describe("Path to the file"),
      replacements: z.preprocess(
        (val) => {
          if (Array.isArray(val)) return val;
          if (typeof val === "string") {
            const trimmed = val.trim();
            if (!trimmed) return [];
            try {
              const parsed = JSON.parse(trimmed);
              return Array.isArray(parsed) ? parsed : [parsed];
            } catch {
              return [];
            }
          }
          if (val && typeof val === "object") return [val];
          return [];
        },
        z.array(
          z.object({
            old: z.string().describe("String to replace"),
            new: z.string().describe("Replacement string"),
            allowMultiple: z.boolean().optional().describe("Allow multiple replacements"),
          }),
        ),
      ),
    }),
    execute: proposeStrReplaceTool,
  }),
  propose_write_file: tool({
    description: "Propose creating or editing a file without applying",
    inputSchema: z.object({
      path: z.string().describe("Path to the file"),
      instructions: z.string().describe("What the change is intended to do"),
      content: z.string().describe("Edit snippet to apply"),
    }),
    execute: proposeWriteFileTool,
  }),
  add_message: tool({
    description: "Add a message to the conversation history",
    inputSchema: z.object({
      role: z.enum(["user", "assistant"]).describe("Message role"),
      content: z.string().describe("Message content"),
    }),
    execute: addMessageTool,
  }),
  set_messages: tool({
    description: "Set the conversation history",
    inputSchema: z.object({
      messages: z.preprocess((val) => {
        if (Array.isArray(val)) return val;
        if (typeof val === "string") {
          const trimmed = val.trim();
          if (!trimmed) return [];
          try {
            const parsed = JSON.parse(trimmed);
            return Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            return [];
          }
        }
        if (val && typeof val === "object") return [val];
        return [];
      }, z.array(z.any()).describe("Array of messages (accepts string or array)")),
    }),
    execute: setMessagesTool,
  }),
  set_output: tool({
    description: "Set the agent output",
    inputSchema: z.any(),
    execute: setOutputTool,
  }),
  skill: tool({
    description: "Load a skill's instructions",
    inputSchema: z.object({
      name: z.string().describe("Skill name"),
    }),
    execute: skillTool,
  }),
  suggest_followups: tool({
    description: "Suggest followup prompts to the user",
    inputSchema: z.object({
      followups: z.preprocess(
        (val) => {
          if (Array.isArray(val)) return val;
          if (typeof val === "string") {
            const trimmed = val.trim();
            if (!trimmed) return [];
            try {
              const parsed = JSON.parse(trimmed);
              return Array.isArray(parsed) ? parsed : [parsed];
            } catch {
              return [];
            }
          }
          if (val && typeof val === "object") return [val];
          return [];
        },
        z.array(
          z.object({
            prompt: z.string().describe("Full prompt text"),
            label: z.string().optional().describe("Short display label"),
          }),
        ),
      ),
    }),
    execute: suggestFollowupsTool,
  }),
  task_completed: tool({
    description: "Signal that the task is complete",
    inputSchema: z.object({}),
    execute: taskCompletedTool,
  }),
  write_todos: tool({
    description: "Write a todo list to track tasks",
    inputSchema: z.object({
      todos: z.preprocess(
        (val) => {
          if (Array.isArray(val)) return val;
          if (typeof val === "string") {
            const trimmed = val.trim();
            if (!trimmed) return [];
            try {
              const parsed = JSON.parse(trimmed);
              return Array.isArray(parsed) ? parsed : [parsed];
            } catch {
              return [];
            }
          }
          if (val && typeof val === "object") return [val];
          return [];
        },
        z.array(
          z.object({
            task: z.string().describe("Task description"),
            completed: z.boolean().describe("Whether task is completed"),
          }),
        ),
      ),
    }),
    execute: writeTodosTool,
  }),
  apply_patch: tool({
    description: "Apply a file operation using Codex-style patch format",
    inputSchema: z.object({
      operation: z.object({
        type: z.enum(["create_file", "update_file", "delete_file"]).describe("Operation type"),
        path: z.string().describe("File path"),
        diff: z.string().optional().describe("Diff content"),
      }),
    }),
    execute: applyPatchTool,
  }),
  ask_user: tool({
    description: "Ask the user multiple choice questions",
    inputSchema: z.object({
      questions: z.preprocess(
        (val) => {
          if (Array.isArray(val)) return val;
          if (typeof val === "string") {
            const trimmed = val.trim();
            if (!trimmed) return [];
            try {
              const parsed = JSON.parse(trimmed);
              return Array.isArray(parsed) ? parsed : [parsed];
            } catch {
              return [];
            }
          }
          if (val && typeof val === "object") return [val];
          return [];
        },
        z.array(
          z.object({
            question: z.string().describe("Question to ask"),
            header: z.string().optional().describe("Short label"),
            options: z.preprocess(
              (val) => {
                if (Array.isArray(val)) return val;
                if (typeof val === "string") {
                  const trimmed = val.trim();
                  if (!trimmed) return [];
                  try {
                    const parsed = JSON.parse(trimmed);
                    return Array.isArray(parsed) ? parsed : [parsed];
                  } catch {
                    return [];
                  }
                }
                if (val && typeof val === "object") return [val];
                return [];
              },
              z.array(
                z.object({
                  label: z.string().describe("Option label"),
                  description: z.string().optional().describe("Option description"),
                }),
              ),
            ),
            multiSelect: z.boolean().optional().describe("Allow multiple selection"),
            validation: z
              .object({
                maxLength: z.number().optional(),
                minLength: z.number().optional(),
                pattern: z.string().optional(),
                patternError: z.string().optional(),
              })
              .optional(),
          }),
        ),
      ),
    }),
    execute: askUserTool,
  }),
  lookup_agent_info: tool({
    description: "Retrieve information about an agent by ID",
    inputSchema: z.object({
      agentId: z.string().describe("Agent ID"),
    }),
    execute: lookupAgentInfoTool,
  }),
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
  read_file: tool({
    description: "Read a file from the filesystem (alias for read)",
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
  run_file_change_hooks: tool({
    description: "Execute file change hooks for modified files",
    inputSchema: z.object({
      files: z.preprocess((val) => {
        // Normalize to array: handle string, array, or malformed input
        // This workaround handles the Codebuff SDK bug where it passes a single string
        // instead of an array (see docs/known-issues/codebuff-sdk-run-file-change-hooks.md)
        if (Array.isArray(val)) {
          // Already an array - filter out non-strings and return
          const filtered = val.filter((item) => typeof item === "string" && item.trim());
          return filtered.length > 0 ? filtered : [];
        }
        if (typeof val === "string") {
          const trimmed = val.trim();
          if (!trimmed) return [];
          // Handle JSON-encoded arrays like '["file1.ts", "file2.ts"]'
          if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
            try {
              const parsed = JSON.parse(trimmed);
              if (Array.isArray(parsed)) {
                const filtered = parsed.filter((item) => typeof item === "string" && item.trim());
                return filtered.length > 0 ? filtered : [];
              }
              return [trimmed];
            } catch {
              // JSON parse failed - treat the whole string as a single file path
              return [trimmed];
            }
          }
          // Single string - wrap in array (this is the Codebuff SDK bug case)
          return [trimmed];
        }
        // Fallback: return empty array
        return [];
      }, z.array(z.string()).describe("List of file paths that were changed (accepts string or array)")),
    }),
    execute: runFileChangeHooksTool,
  }),
  think_deeply: tool({
    description:
      "Deeply consider complex tasks by brainstorming approaches and tradeoffs step-by-step",
    inputSchema: z.object({
      thought: z.string().describe("Detailed step-by-step analysis"),
    }),
    execute: thinkDeeplyTool,
  }),
  update_subgoal: tool({
    description: "Update a subgoal to track progress on multi-step tasks",
    inputSchema: z.object({
      id: z.string().describe("The id of the subgoal to update"),
      status: z
        .enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETE", "ABORTED"])
        .optional()
        .describe("Change the status of the subgoal"),
      log: z.string().optional().describe("Add a log message to the subgoal"),
      plan: z.string().optional().describe("Change the plan for the subgoal"),
    }),
    execute: updateSubgoalTool,
  }),
  add_subgoal: tool({
    description: "Add a new subgoal for tracking progress on complex requests",
    inputSchema: z.object({
      id: z.string().describe("A unique identifier for the subgoal"),
      objective: z.string().describe("The objective of the subgoal, concisely and clearly stated"),
      status: z
        .enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETE", "ABORTED"])
        .optional()
        .describe("The status of the subgoal"),
      log: z.string().optional().describe("A log message for the subgoal progress"),
      plan: z.string().optional().describe("A plan for the subgoal"),
    }),
    execute: addSubgoalTool,
  }),
  find_files: tool({
    description:
      "Find files using local hybrid search first (BM25 + semantic embeddings/RAG), with basic filename fallback. Prefer this before broad code_search when you only need likely files.",
    inputSchema: z.object({
      prompt: z
        .string()
        .describe(
          "Natural language description of files to find, or function/class name. Mention directories to narrow search.",
        ),
    }),
    execute: findFilesTool,
  }),
  web_search: tool({
    description: "Search the web for current information using Linkup API",
    inputSchema: z.object({
      query: z.string().describe("The search query to find relevant web content"),
      depth: z
        .enum(["standard", "deep"])
        .optional()
        .describe(
          "Search depth - 'standard' for quick results, 'deep' for comprehensive search. Default is 'standard'.",
        ),
    }),
    execute: webSearchTool,
  }),
  read_docs: tool({
    description:
      "Fetch up-to-date documentation using ANQR's local Context7 MCP/HTTP service first, with cloud Context7 fallback only if local resolution is unavailable",
    inputSchema: z.object({
      libraryTitle: z
        .string()
        .describe(
          "The library or framework name (e.g., 'Next.js', 'MongoDB', 'React'). Use official name as it appears in documentation.",
        ),
      topic: z
        .string()
        .describe("Specific topic to focus on (e.g., 'routing', 'hooks', 'authentication')"),
      max_tokens: z
        .number()
        .optional()
        .describe(
          "Maximum number of tokens to return. Defaults to 20000. Values less than 10000 are automatically increased to 10000.",
        ),
    }),
    execute: readDocsTool,
  }),
  search_linear_issues: tool({
    description:
      "Search the local Linear RAG index for relevant ANQR issues using cached local retrieval. Prefer this before direct Linear API lookups when you need prior issue context.",
    inputSchema: z.object({
      query: z
        .string()
        .describe("Natural-language search query for prior Linear issues, incidents, regressions, or decisions"),
      limit: z
        .number()
        .optional()
        .describe("Maximum number of matches to return. Defaults to 5."),
    }),
    execute: searchLinearIssuesTool,
  }),

  // ========================================================================
  // Codebuff-native aliases (critical — these are the canonical tool names
  // used by the Codebuff SDK and many models trained on Codebuff docs)
  // ========================================================================

  run_terminal_command: tool({
    description:
      "Execute a shell command and return the output (Codebuff-native name for exec/shell)",
    inputSchema: z.object({
      command: z.string().describe("CLI command valid for user's OS"),
      cwd: z.string().optional().describe("Working directory for the command"),
      timeout_seconds: z.preprocess(
        (val) => coerceOptionalNumberInput(val, undefined),
        z.number().optional().describe("Timeout in seconds (default 30, -1 for no timeout)"),
      ),
    }),
    execute: async ({ command, cwd, timeout_seconds }) => {
      const timeoutMs = calculateTimeoutMs(timeout_seconds);
      try {
        const result = execSync(command, {
          cwd: resolveRequestDir(cwd),
          encoding: "utf-8",
          timeout: timeoutMs || undefined,
          maxBuffer: 10 * 1024 * 1024,
        });
        return { output: result, exitCode: 0 };
      } catch (error) {
        return {
          output: error.stdout || error.message,
          exitCode: error.status || 1,
          error: error.message,
        };
      }
    },
  }),
  write_file: tool({
    description: "Create or overwrite a file with the given content (Codebuff-native)",
    inputSchema: z.object({
      path: z.string().describe("Path to the file relative to the project root"),
      instructions: z.string().optional().describe("What the change is intended to do"),
      content: z.string().describe("Complete file content to write"),
    }),
    execute: async ({ path: filePath, content }) => writeFileTool({ path: filePath, content }),
  }),
  end_turn: tool({
    description: "Signal that the current turn is complete",
    inputSchema: z.object({}),
    execute: taskCompletedTool,
  }),
  create_plan: tool({
    description: "Create a step-by-step plan for a task (alias for write_todos)",
    inputSchema: z.object({
      steps: z.preprocess(
        (val) => {
          if (Array.isArray(val)) return val;
          if (typeof val === "string") {
            try {
              const p = JSON.parse(val);
              return Array.isArray(p) ? p : [p];
            } catch {
              return [];
            }
          }
          if (val && typeof val === "object") return [val];
          return [];
        },
        z.array(
          z.object({
            step: z.string().optional().describe("Step description"),
            task: z.string().optional().describe("Task description"),
            completed: z.boolean().optional().describe("Whether step is done"),
          }),
        ),
      ),
    }),
    execute: async ({ steps }) => {
      const todos = steps.map((s) => ({
        task: s.task || s.step || "(unnamed step)",
        completed: s.completed || false,
      }));
      return writeTodosTool({ todos });
    },
  }),
  browser_logs: tool({
    description: "Check browser console logs (limited — no live browser in this environment)",
    inputSchema: z.object({
      url: z.string().optional().describe("URL to check"),
    }),
    execute: async () => ({
      message:
        "Browser logs are not available in this headless environment. Use run_terminal_command with a linter or test runner instead.",
      logs: [],
    }),
  }),

  // ========================================================================
  // Cross-provider compatibility shims (map external provider tool names
  // to our canonical implementations)
  // ========================================================================

  message: tool({
    description: "Add a message to the conversation (compatibility alias for add_message)",
    inputSchema: z.object({
      role: z.enum(["user", "assistant"]).optional().describe("Message role"),
      content: z.string().describe("Message content"),
    }),
    execute: async ({ role, content }) => addMessageTool({ role: role || "assistant", content }),
  }),
  thinker: tool({
    description: "Think deeply about a problem (alias for think_deeply)",
    inputSchema: z.object({
      thought: z.string().optional().describe("The thought or problem to analyze"),
      prompt: z.string().optional().describe("The problem to think about"),
    }),
    execute: async ({ thought, prompt }) =>
      thinkDeeplyTool({ thought: thought || prompt || "(no thought provided)" }),
  }),
  shell: tool({
    description: "Execute a shell command (OpenAI shell tool compatibility)",
    inputSchema: z.object({
      command: z.string().describe("Shell command to execute"),
      cwd: z.string().optional().describe("Working directory"),
    }),
    execute: execTool,
  }),
  local_shell: tool({
    description: "Execute a command on the local machine (alias for exec/shell)",
    inputSchema: z.object({
      command: z.string().describe("Shell command to execute"),
      cwd: z.string().optional().describe("Working directory"),
    }),
    execute: execTool,
  }),
  code_interpreter: tool({
    description: "Execute code in a sandbox (runs via local shell — Python, Node, etc.)",
    inputSchema: z.object({
      code: z.string().optional().describe("Code to execute"),
      command: z.string().optional().describe("Shell command to execute the code"),
      language: z.string().optional().describe("Programming language (python, javascript, etc.)"),
    }),
    execute: async ({ code, command, language }) => {
      // If a raw shell command is provided, use execTool directly
      if (command) return execTool({ command });
      if (!code) return { error: "No code or command provided" };

      // Use execFileSync to avoid shell escaping issues with user-provided code
      const lang = (language || "python").toLowerCase();
      let bin, args;
      if (lang === "python" || lang === "python3") {
        bin = "python3";
        args = ["-c", code];
      } else if (lang === "javascript" || lang === "node" || lang === "js") {
        bin = "node";
        args = ["-e", code];
      } else if (lang === "bash" || lang === "sh") {
        bin = "bash";
        args = ["-c", code];
      } else {
        bin = "python3";
        args = ["-c", code];
      }
      try {
        const result = execFileSync(bin, args, {
          cwd: getCurrentRequestCwd(),
          encoding: "utf-8",
          timeout: 60000,
          maxBuffer: 10 * 1024 * 1024,
        });
        return { output: result, exitCode: 0 };
      } catch (error) {
        return {
          output: error.stdout || error.message,
          exitCode: error.status || 1,
          error: error.message,
        };
      }
    },
  }),
  file_search: tool({
    description:
      "Search local project context using ANQR's native retrieval stack: code_search for exact query/pattern matches and hybrid RAG-backed find_files for natural-language prompts",
    inputSchema: z.object({
      query: z.string().optional().describe("Search query"),
      pattern: z.string().optional().describe("Search pattern"),
      prompt: z.string().optional().describe("Natural language file description"),
    }),
    execute: async ({ query, pattern, prompt }) => {
      if (pattern || query) {
        return codeSearchTool({ pattern: pattern || query });
      }
      if (prompt) {
        return findFilesTool({ prompt });
      }
      return { error: "Provide a query, pattern, or prompt to search" };
    },
  }),
  browser_search: tool({
    description: "Search the web interactively (Groq GPT-OSS compatibility — uses web_search)",
    inputSchema: z.object({
      query: z.string().describe("Search query"),
    }),
    execute: async ({ query }) => webSearchTool({ query }),
  }),
  visit_website: tool({
    description: "Fetch or navigate to a specific web page (uses web search as best-effort)",
    inputSchema: z.object({
      url: z.string().optional().describe("URL to visit"),
      query: z.string().optional().describe("Search query if no URL"),
    }),
    execute: async ({ url, query }) => {
      const searchQuery = url || query || "";
      if (!searchQuery) return { error: "Provide a url or query" };
      return webSearchTool({ query: searchQuery });
    },
  }),

  // ========================================================================
  // Graceful no-ops for tools that exist on other platforms but cannot be
  // implemented locally. Return a helpful message instead of crashing.
  // ========================================================================

  image_generation: tool({
    description: "Generate or edit images from prompts (not available in this environment)",
    inputSchema: z.object({
      prompt: z.string().optional().describe("Image generation prompt"),
      size: z.string().optional().describe("Image size"),
    }),
    execute: async ({ prompt }) => ({
      error: "image_generation is not available in this environment",
      message: `Cannot generate image for: ${(prompt || "").slice(0, 100)}. Use a web-based image generation service instead.`,
      available: false,
    }),
  }),
  wolfram_alpha: tool({
    description:
      "Query Wolfram Alpha for computation (not available — use code_interpreter instead)",
    inputSchema: z.object({
      query: z.string().describe("Mathematical or scientific query"),
    }),
    execute: async ({ query }) => {
      // Best-effort: try to evaluate with python (using execFileSync to avoid shell escaping issues)
      try {
        const output = execFileSync("python3", ["-c", `print(eval(${JSON.stringify(query)}))`], {
          encoding: "utf-8",
          timeout: 10000,
          maxBuffer: 1024 * 1024,
        });
        return { result: output, source: "python_eval" };
      } catch {
        /* fall through */
      }
      return {
        error: "wolfram_alpha is not available in this environment",
        message: `Use code_interpreter or run_terminal_command with python to compute: ${query.slice(0, 100)}`,
        suggestion: "Use python3 or node for mathematical computation",
      };
    },
  }),
  browser_automation: tool({
    description: "Automate browser interactions (not available in this headless environment)",
    inputSchema: z.object({
      action: z.string().optional().describe("Browser action to perform"),
      url: z.string().optional().describe("URL to navigate to"),
    }),
    execute: async () => ({
      error: "browser_automation is not available in this environment",
      message: "Use Playwright tests (npm run test:basic) or web_search for web interactions.",
      available: false,
    }),
  }),
  computer_use: tool({
    description: "Control computer UI (not available in this headless environment)",
    inputSchema: z.object({
      action: z.string().optional().describe("UI action to perform"),
      coordinate: z.array(z.number()).optional().describe("Screen coordinates"),
      text: z.string().optional().describe("Text to type"),
    }),
    execute: async () => ({
      error: "computer_use is not available in this environment",
      message:
        "This is a headless server environment. Use run_terminal_command for CLI operations.",
      available: false,
    }),
  }),
  tts: tool({
    description: "Text-to-speech synthesis (not available in this environment)",
    inputSchema: z.object({
      text: z.string().optional().describe("Text to synthesize"),
      input: z.string().optional().describe("Text input"),
    }),
    execute: async () => ({
      error: "tts is not available in this environment",
      message: "Text-to-speech is not supported in this headless server environment.",
      available: false,
    }),
  }),
  connector_gmail: tool({
    description: "Gmail connector (not available — requires Groq connector setup)",
    inputSchema: z.object({
      action: z.string().optional().describe("Gmail action"),
      query: z.string().optional().describe("Search query"),
    }),
    execute: async () => ({
      error: "connector_gmail is not available in this environment",
      message: "Gmail connector requires Groq platform. Not available locally.",
      available: false,
    }),
  }),
  connector_googlecalendar: tool({
    description: "Google Calendar connector (not available — requires Groq connector setup)",
    inputSchema: z.object({
      action: z.string().optional().describe("Calendar action"),
    }),
    execute: async () => ({
      error: "connector_googlecalendar is not available in this environment",
      message: "Google Calendar connector requires Groq platform. Not available locally.",
      available: false,
    }),
  }),
  connector_googledrive: tool({
    description: "Google Drive connector (not available — requires Groq connector setup)",
    inputSchema: z.object({
      action: z.string().optional().describe("Drive action"),
      query: z.string().optional().describe("Search query"),
    }),
    execute: async () => ({
      error: "connector_googledrive is not available in this environment",
      message: "Google Drive connector requires Groq platform. Not available locally.",
      available: false,
    }),
  }),
  mcp_list_tools: tool({
    description:
      "List the locally available tools plus ANQR-native context systems such as Context7 docs resolution and hybrid RAG/file retrieval",
    inputSchema: z.object({
      server: z.string().optional().describe("MCP server name"),
    }),
    execute: async () => {
      let context7 = { configured: true, reachable: false, endpoint: `${CONTEXT7_HTTP_BASE}/health` };
      try {
        const res = await fetch(`${CONTEXT7_HTTP_BASE}/health`, {
          signal: AbortSignal.timeout(3000),
        });
        if (res.ok) {
          const data = await res.json();
          context7 = {
            configured: true,
            reachable: data.status === "ok" || data.status === "degraded",
            endpoint: `${CONTEXT7_HTTP_BASE}/health`,
            status: data.status,
          };
        }
      } catch {
        // best effort only
      }

      return {
        available_tools: Object.keys(tools),
        native_context: {
          context7,
          rag_search: {
            preferred_tools: [
              "read_docs",
              "search_linear_issues",
              "find_files",
              "file_search",
              "code_search",
            ],
            stats: getHybridSearchStats(),
          },
          linear_rag: getLinearIndexStats(),
        },
        preferred_workflow: [
          "Use read_docs for library/framework questions before web_search.",
          "Use search_linear_issues when you need prior ANQR issue context before calling the Linear API directly.",
          "Use find_files or file_search for natural-language repository discovery before broad glob/code scans.",
          "Use code_search after file discovery when exact symbols or strings are needed.",
        ],
        message:
          "MCP server tools are not directly exposed through this bridge, but ANQR-native Context7 and hybrid RAG retrieval are available through the local tools above.",
      };
    },
  }),
};

// --------------------------------------------------------------------------
// Catch-all Proxy for unknown tools
// --------------------------------------------------------------------------
//
// Models sometimes hallucinate tool names that don't exist in our tools map.
// Without a catch-all, the AI SDK throws an error and the request fails.
// This Proxy intercepts property access and dynamically creates a graceful
// no-op tool definition for any unknown tool name, returning a helpful message
// instead of crashing. Known tools pass through unchanged.
//
// The Proxy only intercepts `get` — Object.keys(), Object.entries(), etc.
// still return only the explicitly defined tools (via the default `ownKeys`).
// --------------------------------------------------------------------------

const knownToolNames = new Set(Object.keys(tools));

const toolsProxy = new Proxy(tools, {
  get(target, prop, receiver) {
    // Pass through existing tools, symbols, and non-string properties
    if (typeof prop !== "string" || prop in target) {
      return Reflect.get(target, prop, receiver);
    }

    // Ignore internal JS/Node properties that aren't tool names
    if (prop === "then" || prop === "toJSON" || prop === "constructor" || prop.startsWith("_")) {
      return undefined;
    }

    logWarn(`⚠️ Unknown tool requested: "${prop}" — returning graceful no-op`);

    return tool({
      description: `Unknown tool "${prop}" (catch-all — this tool is not available)`,
      inputSchema: z.object({}).passthrough(),
      execute: async (args) => {
        logWarn(`🔧 Catch-all invoked for unknown tool "${prop}"`, {
          argsKeys: Object.keys(args || {}),
        });
        return {
          error: `Tool "${prop}" is not available in this environment`,
          message: `The tool "${prop}" does not exist. Available tools: ${[...knownToolNames].slice(0, 20).join(", ")}...`,
          available: false,
          suggestion:
            "Check available tools with mcp_list_tools or use one of the listed tools above.",
        };
      },
    });
  },

  has(target, prop) {
    // Report all string properties as present so the AI SDK doesn't reject
    // unknown tool calls before they reach our execute handler
    if (typeof prop === "string" && prop !== "then" && !prop.startsWith("_")) {
      return true;
    }
    return Reflect.has(target, prop);
  },
});

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
    logError(`Provider ${name} not supported - no baseUrl for default fallback`);
    throw new Error(`Provider ${name} not supported - no baseUrl for default fallback`);
  }
  return createOpenAiCompatibleModel(model, apiKey, baseUrl);
}

// --------------------------------------------------------------------------
// Bridge state
// --------------------------------------------------------------------------


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

const MAX_TOOL_ITERATIONS = 100; // Reduced from 200 to limit memory usage
const REQUEST_TIMEOUT_MS = 30 * 60 * 1000; // 30 min — hard timeout per HTTP request (prevents infinite hangs)
const FALLBACK_DELAY_MS = 1000;
const MAX_RESPONSE_TEXT_BYTES = 512 * 1024; // 512KB cap on accumulated response text

// Opportunistic GC between requests (requires --expose-gc flag)
const maybeGC = typeof globalThis.gc === "function" ? () => globalThis.gc() : () => {};

// Periodic garbage collection to prevent memory bloat (every 5 minutes)
if (typeof globalThis.gc === "function") {
  setInterval(() => {
    const mem = process.memoryUsage();
    const heapMB = Math.round(mem.heapUsed / 1024 / 1024);
    const rssMB = Math.round(mem.rss / 1024 / 1024);
    logInfo(`[gc] Periodic GC: heap=${heapMB}MB rss=${rssMB}MB`);
    globalThis.gc();
    const after = process.memoryUsage();
    const heapAfter = Math.round(after.heapUsed / 1024 / 1024);
    const rssAfter = Math.round(after.rss / 1024 / 1024);
    logInfo(`[gc] After GC: heap=${heapAfter}MB rss=${rssAfter}MB (freed ${heapMB - heapAfter}MB)`);
  }, 5 * 60 * 1000);
  logInfo(`[gc] Periodic GC enabled (every 5 minutes)`);
}

// Concurrency control to prevent memory overload
const MAX_CONCURRENT_REQUESTS = 8; // Maximum simultaneous requests (rejects excess with 429)

// Periodic statistics logging interval (every 10 requests)
const STATS_LOG_INTERVAL = 10;
let requestCount = 0;

// Continuous provider probe — runs in parallel, re-evaluates after 3 completions
const PROBE_CYCLE_INTERVAL_MS = 30 * 60 * 1000; // 30 min between probe cycles
const PROBE_CYCLE_TURN_THRESHOLD = 200; // Re-evaluate after 200 turns of current provider
const PROBE_COMPLETIONS_BEFORE_RANKING = 3; // Rank providers after 3 probe completions
let probeCompletionCount = 0;
let probeTurnCounter = 0; // Tracks turns since last probe
let lastProbeStartTime = Date.now();
let lastProbeTimeCheck = Date.now(); // Track time-based trigger
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
 * 1. Check reachability and API keys (parallel, all eligible providers)
 * 2. Probe tool capability for reachable providers (parallel, no batching)
 * 3. After 3 completions, rank and log all providers in metrics cache
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
  lastProbeTimeCheck = Date.now(); // Reset time check
  probeTurnCounter = 0; // Reset turn counter

  try {
    logInfo(`🔍 Starting continuous provider probe cycle ${probeCompletionCount + 1}...`);

    // Phase 1: Check reachability and API keys (parallel, all eligible providers)
    const excludeNames = [...BRIDGE_PROVIDER_BLOCKLIST];

    logInfo(
      `🔍 ACCESSIBILITY PROBE: Checking reachability for all providers (excluding ${excludeNames.length} blocked)...`,
    );
    logInfo(`⏳ PROBE CYCLE STARTED: Beginning provider accessibility validation...`);

    providerStatusCache.configured = getConfiguredProviders({ excludeNames });
    providerStatusCache.probeResults = await probeAllProviders({ excludeNames });
    providerStatusCache.lastProbeAt = new Date().toISOString();

    const reachable = providerStatusCache.probeResults.filter((r) => r.available);
    const total = providerStatusCache.configured.length;
    logInfo(
      `✅ ACCESSIBILITY PROBE COMPLETE: ${reachable.length}/${total} providers reachable (API keys validated)`,
    );
    logInfo(`✅ PROBE PHASE 1 COMPLETE: Accessibility validation finished`);

    // Log detailed accessibility results
    for (const probe of providerStatusCache.probeResults) {
      if (probe.status === "excluded") continue;
      const icon = probe.available ? "✅" : "❌";
      const duration = probe.durationMs > 0 ? ` (${probe.durationMs}ms)` : "";
      logInfo(`  ${icon} ACCESSIBILITY: ${probe.name} - ${probe.status}${duration}`);
    }

    // Phase 2: Probe tool capability for reachable providers (parallel, no batching)
    logInfo(
      `🔧 TOOL CAPABILITY PROBE: Testing ${reachable.length} reachable providers (parallel, no batching)...`,
    );
    logInfo(`⏳ PROBE PHASE 2 STARTED: Beginning tool capability validation...`);
    await probeAllToolCapability();
    logInfo(
      `✅ TOOL CAPABILITY PROBE COMPLETE: ${toolCapableProviders.size} capable, ${nonToolCapableProviders.size} excluded`,
    );
    logInfo(`✅ PROBE PHASE 2 COMPLETE: Tool capability validation finished`);

    // Increment completion counter
    probeCompletionCount++;

    // Phase 3: After 3 completions, rank and log all providers in metrics cache
    if (probeCompletionCount >= PROBE_COMPLETIONS_BEFORE_RANKING) {
      logInfo(`🔍 Phase 3: Ranking providers after ${probeCompletionCount} probe completions...`);
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

        // SKIP: Don't send Discord notifications during probe cycles
        // Sending probe results to Discord creates bridge requests that trigger more probes
        // causing a feedback loop that leads to OOM
        // Provider rankings are logged server-side via logInfo above
        logInfo(`📊 Provider rankings logged server-side (not sent to Discord)`);
      }
      // Reset counter but keep probing
      probeCompletionCount = 0;
    }

    logInfo(
      `🔍 Probe cycle complete (${probeCompletionCount}/${PROBE_COMPLETIONS_BEFORE_RANKING} before next ranking)`,
    );
    logInfo(`✅ PROBE CYCLE COMPLETE: All phases finished successfully`);
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
  const throttled = getThrottledProviders();
  const excludeSet = new Set([...excludedNames, ...nonToolCapableProviders, ...throttled]);

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

      // P0 FIX: If the sticky provider is already in the exclude set (e.g., recently
      // failed, non-tool-capable, or explicitly excluded), clear the sticky immediately
      // and allow ALL providers. Never restrict allowedNames to a single unavailable
      // provider — that causes the "No providers available" P0 outage.
      if (excludeSet.has(providerName)) {
        safeLogDebug(
          `⚠️ Sticky provider ${providerName} is excluded — clearing sticky, allowing all providers`,
        );
        clearSessionProvider(sessionId);
        // Fall through to return unrestricted options below
      } else if (tier === "paid" && mode === "paid") {
        // Paid providers: stick until exhausted
        safeLogDebug(`📌 Session sticky: ${providerName} (paid mode, ${turnCount} turns)`);
        return {
          allowedNames: [providerName],
          excludeNames: [...excludeSet],
        };
      } else if (turnCount < turnLimit) {
        // Free providers: rotate after turn limit
        safeLogDebug(`📌 Session sticky: ${providerName} (${turnCount}/${turnLimit} turns)`);
        return {
          allowedNames: [providerName],
          excludeNames: [...excludeSet],
        };
      }
      // Rotation: turn limit reached, exclude current provider to force rotation
      safeLogDebug(`🔄 Rotating: ${providerName} (${turnCount}/${turnLimit} turns reached)`);
      excludeSet.add(providerName);
      clearSessionProvider(sessionId);
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
const TOOL_PROBE_RETRY_DELAY_MS = 60_000;
const GATEWAY_BATCH_SIZE = 3; // Max concurrent probes per shared API gateway
const GATEWAY_BATCH_DELAY_MS = 3_000; // Delay between batches within a gateway
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

  // CHANGED: Skip early-exit for already-classified providers to ensure we always
  // collect fresh metrics. Classification is still used for provider selection,
  // but we probe everyone every cycle to maintain up-to-date performance data.
  // Cached classification allows fast startup; fresh probes provide ongoing metrics.

  // P0 FIX: Safety-net providers (local Ollama) are NEVER excluded from selection.
  // They may not support structured tool calling, but a degraded response is always
  // preferable to a total outage. If tools fail at runtime, invokeWithAI will handle
  // the provider without tools (useTools=false via providerSupportsTools).
  if (providerDef.tier === "local-safety-net") {
    toolCapableProviders.add(name);
    return { name, status: "safety-net-always-allowed" };
  }

  // SDK-based providers are handled outside AI SDK tool protocol
  if (providerDef.requiresSdk || providerDef.driver === "codex-sdk") {
    toolCapableProviders.add(name);
    return { name, status: "sdk-capable" };
  }

  // Known tool-capable providers (e.g., codebuff) skip the actual probe.
  // Codebuff routes through its own bridge (port 4318) and uses internal tools
  // (spawn_agent_inline, set_messages, end_turn) rather than OpenAI-style function
  // calling. Probing it wastes ~15s (paid->free fallback) and always returns
  // INCONCLUSIVE. Since we trust the configuration, skip the probe entirely.
  if (KNOWN_TOOL_CAPABLE.has(name)) {
    toolCapableProviders.add(name);
    return { name, status: "known-capable" };
  }

  // OpenRouter: all models share the same API key and gateway.
  // If another OpenRouter model already proved capable/non-capable,
  // infer the same for this model (saves API quota and avoids rate limits).
  // Models that genuinely lack tool support return a distinct "No endpoints
  // found that support tool use" error, so inference from a capable sibling
  // is safe — non-capable models will still be caught by their own probes.
  if (OPENROUTER_PROVIDER_NAME_SET.has(name)) {
    for (const orName of OPENROUTER_PROVIDER_NAME_SET) {
      if (toolCapableProviders.has(orName) && !KNOWN_TOOL_CAPABLE.has(orName)) {
        toolCapableProviders.add(name);
        return { name, status: "inferred-capable" };
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

  const startTime = Date.now();
  logInfo(`🔧 TOOL PROBE START: ${name} - Testing structured tool calling with add(2, 2)`);
  logInfo(`⏳ PROBING: ${name} - Sending test request to validate tool capability...`);
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
        setTimeout(() => {
          logError("Tool probe timeout exceeded");
          reject(new Error("tool-probe-timeout"));
        }, TOOL_PROBE_TIMEOUT_MS),
      ),
    ]);

    const durationMs = Date.now() - startTime;
    const hasStructuredToolCall = result.steps?.some((s) => s.toolCalls?.length > 0);
    const text = result.text || "";
    const hasRawToolJson = RAW_TOOL_JSON_RE.test(text);

    logInfo(
      `🔧 TOOL PROBE RESULT: ${name} - hasStructuredToolCall=${hasStructuredToolCall}, hasRawToolJson=${hasRawToolJson}, answer="${text.slice(0, 50)}"`,
    );

    if (hasStructuredToolCall && !hasRawToolJson) {
      toolCapableProviders.add(name);

      // Record successful probe in dedicated probe metrics (separate from runtime)
      recordProbeResult(name, { success: true, durationMs });

      // ALSO record as runtime metrics to populate rankings immediately
      // This ensures providers appear in rankings even before real requests
      recordProviderSelection(name);
      recordProviderSuccess(name);
      recordProviderMetrics(name, {
        durationMs,
        inputTokens: result.usage?.promptTokens || 0,
        outputTokens: result.usage?.completionTokens || 0,
        validationPassed: true,
      });

      logInfo(
        `✅ TOOL PROBE PASS: ${name} - Structured tool calling validated (${durationMs}ms, answer: "${text.slice(0, 50)}")`,
      );
      logInfo(
        `✅ DETERMINATION: ${name} marked as TOOL-CAPABLE (supports structured tool calling)`,
      );
      return { name, status: "capable", durationMs, answer: text };
    }

    if (hasRawToolJson) {
      nonToolCapableProviders.add(name);
      recordProbeResult(name, { success: false, durationMs });
      logWarn(`❌ TOOL PROBE FAIL: ${name} - Emitted raw JSON instead of structured tool calls`);
      logWarn(
        `❌ DETERMINATION: ${name} marked as NON-TOOL-CAPABLE (excluded from future selection)`,
      );
      return { name, status: "non-capable-raw-json" };
    }

    // Model responded with text but didn't use the tool — inconclusive.
    // Don't exclude; the runtime safety net will catch it if needed.
    logWarn(
      `⚠️ TOOL PROBE INCONCLUSIVE: ${name} - No tool call detected, leaving in pool for runtime validation`,
    );
    return { name, status: "no-tool-call" };
  } catch (err) {
    const errStr = String(err).slice(0, 300);

    // Rate limit — don't exclude; assume capable until proven otherwise
    // Don't record probe failure for rate limits — not indicative of capability
    if (/429|rate.?limit|too many|quota|resource.?exhausted/i.test(errStr)) {
      logWarn(`⏳ TOOL PROBE RATE LIMITED: ${name} - Will retry later`);
      return { name, status: "rate-limited" };
    }

    // Explicit tool rejection by the API — definitive negative signal
    if (
      /tool_choice|tools.*not.*support|function.*call.*not|does not support|no endpoints.*tool/i.test(
        errStr,
      )
    ) {
      nonToolCapableProviders.add(name);
      recordProbeResult(name, { success: false, durationMs: Date.now() - startTime });
      logWarn(`❌ TOOL PROBE FAIL: ${name} - API explicitly rejected tool support`);
      logWarn(`❌ DETERMINATION: ${name} marked as NON-TOOL-CAPABLE (API rejected tools)`);
      return { name, status: "non-capable-rejected" };
    }

    // Infrastructure/config errors — NOT indicative of tool capability
    // (account guardrails, data policy restrictions, invalid/expired API keys, team membership)
    if (
      /guardrail|data.?policy|invalid.*key|expired.*token|invalid.*format.*key|not part of team/i.test(
        errStr,
      )
    ) {
      logWarn(`🔧 TOOL PROBE INFRA: ${name} - ${errStr.slice(0, 150)}`);
      return { name, status: "infrastructure-error" };
    }

    if (/timeout|tool-probe-timeout/i.test(errStr)) {
      recordProbeResult(name, { success: false, durationMs: Date.now() - startTime });
      logWarn(`⏱️ TOOL PROBE TIMEOUT: ${name} - Exceeded ${TOOL_PROBE_TIMEOUT_MS}ms`);
      return { name, status: "timeout" };
    }

    // Log the actual error for debugging
    logWarn(`❌ TOOL PROBE ERROR: ${name} - ${errStr.slice(0, 150)}`);

    // Record probe error in dedicated probe metrics (separate from runtime)
    recordProbeResult(name, { success: false, durationMs: Date.now() - startTime });

    return { name, status: "probe-error" };
  }
}

/**
 * Classify providers by their shared API gateway/key.
 * Providers sharing a gateway are batched sequentially to avoid rate-limit storms.
 */
function getProviderGateway(name) {
  if (OPENROUTER_PROVIDER_NAME_SET.has(name)) return "openrouter";
  if (name === "gemini" || name === "gemini-lite") return "gemini";
  if (name.startsWith("ollama")) return "ollama";
  return name;
}

/**
 * Probe providers within a single gateway in small sequential batches.
 * Prevents rate-limit storms when many models share one API key.
 */
async function probeGatewayBatched(gatewayName, providers, batchSize, delayMs) {
  const results = [];
  for (let i = 0; i < providers.length; i += batchSize) {
    const batch = providers.slice(i, i + batchSize);
    logDebug(
      `🔧 Gateway ${gatewayName}: batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(providers.length / batchSize)} (${batch.map((p) => p.name).join(", ")})`,
    );
    const batchResults = await Promise.allSettled(
      batch.map((p) => probeToolCapabilityForProvider(p)),
    );
    for (const r of batchResults) {
      if (r.status === "fulfilled") results.push(r.value);
    }
    if (i + batchSize < providers.length) await sleep(delayMs);
  }
  return results;
}

async function probeAllToolCapability() {
  const available = (providerStatusCache.probeResults || [])
    .filter((r) => r.available)
    .map((r) => r.name);
  const availableSet = new Set(available);

  // Use full provider definitions (with envVar, baseUrl, loadToken) for probing
  const excludeNames = [...BRIDGE_PROVIDER_BLOCKLIST];
  const allDefs = getProviderDefinitions({ excludeNames });

  // CHANGED: Always probe ALL available providers to collect fresh metrics,
  // even if they're already classified. This ensures we get comprehensive
  // metrics from every provider after startup while still allowing fast startup
  // via cached classification for provider selection.
  const toProbe = allDefs.filter((p) => availableSet.has(p.name));

  if (toProbe.length === 0) {
    logDebug(`🔧 Tool probe: no available providers to probe`);
    return;
  }

  // Group by API gateway to avoid rate-limit storms (e.g., 27 OpenRouter models share one key)
  const gateways = new Map();
  for (const p of toProbe) {
    const gw = getProviderGateway(p.name);
    if (!gateways.has(gw)) gateways.set(gw, []);
    gateways.get(gw).push(p);
  }

  const gatewayNames = [...gateways.entries()].map(([gw, ps]) => `${gw}(${ps.length})`);
  logDebug(
    `🔧 Tool capability probe: ${toProbe.length} providers across ${gateways.size} gateways: ${gatewayNames.join(", ")}`,
  );

  // Probe gateways in parallel; batch sequentially within large gateways
  const gatewayPromises = [];
  for (const [gw, providers] of gateways) {
    if (providers.length <= GATEWAY_BATCH_SIZE) {
      gatewayPromises.push(
        Promise.allSettled(providers.map((p) => probeToolCapabilityForProvider(p))).then(
          (settled) => settled.filter((r) => r.status === "fulfilled").map((r) => r.value),
        ),
      );
    } else {
      gatewayPromises.push(
        probeGatewayBatched(gw, providers, GATEWAY_BATCH_SIZE, GATEWAY_BATCH_DELAY_MS),
      );
    }
  }

  const gatewayResults = await Promise.allSettled(gatewayPromises);
  const results = [];
  for (const gr of gatewayResults) {
    if (gr.status === "fulfilled" && Array.isArray(gr.value)) {
      results.push(...gr.value);
    }
  }

  for (const r of results) {
    let icon = "❓";
    if (toolCapableProviders.has(r.name)) {
      icon = "✅";
    } else if (nonToolCapableProviders.has(r.name)) {
      icon = "🚫";
    }
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
  return withRequestCwd(options.cwd, () => invokeWithAIInner(provider, messages, options));
}

async function invokeWithAIInner(provider, messages, options = {}) {
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

  const estimatedInputTokens = estimateMessagesTokens(rawMessages);
  let effectiveMax = getEffectiveMaxTokens(provider.name);
  if (shouldReduceContextForTPM(provider.name, estimatedInputTokens)) {
    effectiveMax = Math.max(Math.floor(effectiveMax * 0.5), 1000);
    logInfo(
      `⚡ Proactive TPM reduction for ${provider.name}: effectiveMax halved to ${effectiveMax}`,
    );
  }
  const aiMessages = truncateMessagesForProvider(rawMessages, provider.name, {
    useTools,
    maxTokensOverride: effectiveMax,
  });
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

    // Execution metrics for structured result contract (passed to runner via _symphonyResult)
    const executionMetrics = {
      mutationCount: 0,
      changedFiles: new Set(),
      taskCompleted: false,
      toolCallCount: 0,
      stepCount: 0,
      validationToolsRun: new Set(),
    };

    // Streaming with tool execution (tools disabled for providers that don't support them)
    const result = await streamText({
      model,
      messages: aiMessages,
      ...(useTools
        ? { tools: toolsProxy, toolChoice: "auto", stopWhen: stepCountIs(MAX_TOOL_ITERATIONS) }
        : {}),
      onStepFinish: (step) => {
        executionMetrics.stepCount++;
        if (step.toolCalls && step.toolCalls.length > 0) {
          for (const tc of step.toolCalls) {
            executionMetrics.toolCallCount++;
            const input = tc.input ?? tc.args;

            // Log tool call with resolved arguments (from tc.input after tool-input-delta accumulation)
            // This is the accurate representation of what the tool actually received
            if (tc.toolName === "read") {
              logInfo(`🔧 ${tc.toolName}: (output suppressed)`);
              logDebug(`[invokeWithAI] Tool call resolved`, {
                toolName: tc.toolName,
                toolCallId: tc.toolCallId,
                argsKeys: input ? Object.keys(input) : [],
              });
            } else {
              const summary = input ? JSON.stringify(input).slice(0, 200) : "(no args)";
              logInfo(`🔧 ${tc.toolName}: ${summary}`);
              logDebug(`[invokeWithAI] Tool call resolved`, {
                toolName: tc.toolName,
                toolCallId: tc.toolCallId,
                argsKeys: input ? Object.keys(input) : [],
              });
            }

            // Track mutations (write, write_file, str_replace, apply_patch)
            if (
              tc.toolName === "write" ||
              tc.toolName === "write_file" ||
              tc.toolName === "str_replace" ||
              tc.toolName === "apply_patch"
            ) {
              executionMetrics.mutationCount++;
              const filePath = input?.path || input?.operation?.path;
              if (filePath) executionMetrics.changedFiles.add(filePath);
              if (currentRequestId) trackFileChange(currentRequestId);
            }

            // Track validation tool usage
            if (
              tc.toolName === "run_typecheck" ||
              tc.toolName === "run_lint" ||
              tc.toolName === "run_cspell" ||
              tc.toolName === "run_ast_density" ||
              tc.toolName === "run_tests"
            ) {
              executionMetrics.validationToolsRun.add(tc.toolName);
            }

            // Track task completion signal
            if (tc.toolName === "task_completed") {
              executionMetrics.taskCompleted = true;
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
        // Note: The step limit warning is handled after the stream loop (line ~2085)
        // because errorCount is not yet available in onFinish callback.
      },
    });

    // Process the full stream — includes reasoning, text, tool-call, and tool-result events
    let fullText = "";
    let fullTextCapped = false;
    let streamErrorDetail = null;
    let fatalStreamError = null;
    let hasTextDeltas = false;
    let partCount = 0;
    let textDeltaCount = 0;
    let toolCallCount = 0;
    let errorCount = 0;

    logDebug(`[invokeWithAI] Processing fullStream...`);

    // Track <think> blocks in text-delta for models that embed reasoning in text
    let inThinkBlock = false;

    // Track empty reasoning-delta events to suppress log spam
    let emptyReasoningDeltaCount = 0;

    for await (const part of result.fullStream) {
      partCount++;

      // Build detailed log context based on part type
      const logContext = { type: part.type };

      // Check for empty reasoning-delta to suppress log spam
      const isEmptyReasoningDelta = part.type === "reasoning-delta" && (!part.textDelta || part.textDelta.length === 0);

      // DIAGNOSTIC: Log all event types for non-Codebuff providers (skip empty reasoning-delta)
      if (provider.name !== "codebuff" && provider.name !== "codex" && !isEmptyReasoningDelta) {
        logInfo(`🔍 [${provider.name}] Stream event: ${part.type}`, { 
          type: part.type,
          hasTextDelta: !!part.textDelta,
          hasToolName: !!part.toolName,
          preview: part.textDelta?.slice(0, 50) || part.toolName || ""
        });
      }

      // Track empty reasoning-delta count (skip logging for these)
      if (isEmptyReasoningDelta) {
        emptyReasoningDeltaCount++;
        continue; // Skip further processing for empty reasoning-delta
      }

      if (part.type === "text-delta") {
        const deltaText = part.textDelta || "";
        logContext.length = deltaText.length;
        logContext.preview = deltaText.slice(0, 100);
        hasTextDeltas = true;
        textDeltaCount++;
      } else if (part.type === "tool-call") {
        logContext.toolName = part.toolName;
        logContext.toolCallId = part.toolCallId;
        if (part.args) {
          logContext.argsPreview = JSON.stringify(part.args).slice(0, 100);
        }
      } else if (part.type === "tool-result") {
        logContext.toolName = part.toolName;
        logContext.toolCallId = part.toolCallId;
        if (part.result) {
          const resultStr =
            typeof part.result === "string" ? part.result : JSON.stringify(part.result);
          logContext.resultPreview = resultStr.slice(0, 100);
        }
      } else if (part.type === "reasoning-delta") {
        const deltaText = part.textDelta || "";
        logContext.length = deltaText.length;
        logContext.preview = deltaText.slice(0, 100);
        // CRITICAL FIX: Only log non-empty reasoning-delta events to prevent log spam
        // from infinite empty reasoning-delta loops (ANQ-XXX)
        if (deltaText.length > 0) {
          logInfo(`💡 [${provider.name}] reasoning-delta event detected`, {
            length: deltaText.length,
            preview: deltaText.slice(0, 100)
          });
        }
      } else if (part.type === "reasoning-start") {
        logInfo(`💡 [${provider.name}] reasoning-start event`, { providerName: provider.name });
      } else if (part.type === "reasoning-end") {
        logInfo(`💡 [${provider.name}] reasoning-end event`, { providerName: provider.name });
      } else if (part.type === "error") {
        const errorMsg = errorToString(part.error || part);
        logContext.errorPreview = errorMsg.slice(0, 150);
      } else if (part.type === "finish") {
        logContext.finishReason = part.finishReason;
      }

      // Suppress blank DEBUG lines (text-delta or reasoning-delta with length 0)
      const isEmptyTextDelta = part.type === "text-delta" && (!part.textDelta || part.textDelta.length === 0);
      if (!isEmptyTextDelta && !isEmptyReasoningDelta) {
        logDebug(`[invokeWithAI] Stream part ${partCount}`, logContext);
      }

      // Process stream parts based on type
      if (part.type === "reasoning-start") {
        // Emit newline when reasoning starts (no emoji for Discord)
        if (onChunk) onChunk({ type: "text", text: "\n" });
      } else if (part.type === "reasoning-delta") {
        // CRITICAL BUG FIX (ANQ-XXX): Accumulate reasoning-delta into fullText
        // Previously, reasoning-delta was only forwarded to onChunk but never
        // accumulated, causing "Stream completed but produced no content" errors
        // when models send reasoning via reasoning-delta instead of text-delta.
        // This is the root cause of the OpenRouter streaming failures.
        const reasoningDelta = part.textDelta || "";
        if (reasoningDelta && reasoningDelta.length > 0) {
          // Accumulate into fullText (same as text-delta)
          if (!fullTextCapped) {
            if (fullText.length + reasoningDelta.length > MAX_RESPONSE_TEXT_BYTES) {
              fullTextCapped = true;
              logWarn(`⚠️ fullText capped at ${MAX_RESPONSE_TEXT_BYTES} bytes (reasoning-delta)`, {
                currentLength: fullText.length,
                deltaLength: reasoningDelta.length,
                maxBytes: MAX_RESPONSE_TEXT_BYTES,
              });
            } else {
              fullText += reasoningDelta;
            }
          }
          // Forward to client for streaming
          if (onChunk) {
            onChunk({ type: "text", text: reasoningDelta });
          }
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

        // Detect <think> blocks for models that embed reasoning in text
        // (e.g., Qwen, DeepSeek, and other models that don't emit reasoning-delta events)
        // Simple boundary detection - handles multi-chunk blocks correctly
        if (delta.includes("<think>")) {
          if (!inThinkBlock) {
            inThinkBlock = true;
            // Emit newline when thinking starts (no emoji for Discord)
            if (onChunk) onChunk({ type: "text", text: "\n" });
            logInfo(`💭 [${provider.name}] <think> block start detected in text-delta`, {
              providerName: provider.name,
              deltaPreview: delta.slice(0, 100)
            });
          }
        }

        // Forward non-empty text deltas to client immediately
        // This handles both thinking blocks and normal text-delta content
        if (onChunk && delta && delta.length > 0) {
          onChunk({ type: "text", text: delta });
        }

        if (delta.includes("</think>")) {
          if (inThinkBlock) {
            inThinkBlock = false;
            // Emit newline when thinking ends
            if (onChunk) onChunk({ type: "text", text: "\n" });
            logInfo(`💭 [${provider.name}] <think> block end detected in text-delta`, {
              providerName: provider.name
            });
          }
        }

        // Log non-empty text-delta events for debugging (first 200 chars)
        if (delta && delta.length > 0) {
          logDebug(`📨 text-delta (${delta.length} chars): ${delta.slice(0, 200)}`, {
            deltaLength: delta.length,
            totalLength: fullText.length,
            inThinkBlock,
          });
        }
      } else if (part.type === "tool-call") {
        toolCallCount++;
        // Note: At this point, part.args may be empty because args are streamed separately
        // via tool-input-delta events. The actual resolved arguments are available in
        // onStepFinish where we log using tc.input (which has the final resolved args).
        // We log a placeholder here and the real logging happens in onStepFinish.
        logDebug(`[invokeWithAI] Tool call ${toolCallCount}`, {
          toolName: part.toolName,
          toolCallId: part.toolCallId,
          note: "args populated via tool-input-delta, see onStepFinish for resolved input",
        });
        // Tool activity messages are logged server-side but NOT sent to client/Discord
        // to avoid noise in Discord notifications
      } else if (part.type === "tool-result") {
        logInfo(`✅ ${part.toolName} done`);
        logDebug(`[invokeWithAI] Tool result`, {
          toolName: part.toolName,
          toolCallId: part.toolCallId,
          hasResult: !!part.result,
          resultType: typeof part.result,
        });
        // Tool activity messages are logged server-side but NOT sent to client/Discord
        // to avoid noise in Discord notifications
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
        // Classify stream error for adaptive context — store fatal errors
        // (context-too-large, rate-limited) so we can throw after stream completes
        const streamErrType = classifyError(rootError);
        if (
          !fatalStreamError &&
          (streamErrType === ERROR_TYPES.CONTEXT_TOO_LARGE ||
            streamErrType === ERROR_TYPES.RATE_LIMITED)
        ) {
          fatalStreamError = rootError;
          logInfo(
            `🚨 Fatal stream error (${streamErrType}): will throw after stream completes to trigger adaptive context + fallback`,
            {
              providerName: provider.name,
              errorType: streamErrType,
              statusCode: rootError?.statusCode,
            },
          );
        }
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
      hasFatalStreamError: !!fatalStreamError,
      emptyReasoningDeltaCount,
    });

    // Summary of suppressed empty reasoning-delta events
    if (emptyReasoningDeltaCount > 0) {
      logDebug(`[${provider.name}] Suppressed empty reasoning-delta events`, {
        count: emptyReasoningDeltaCount,
      });
    }

    // If stream contained a fatal error (413/context or 429/rate-limit), throw
    // the original error to trigger adaptive context recording and provider
    // fallback in the invokeWithFallbackStream catch block
    if (fatalStreamError) {
      throw fatalStreamError;
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
      } catch (error_) {
        // result.text can also throw AI_NoOutputGeneratedError — don't mask the original issue
        logDebug(`⚠️ result.text fallback also failed: ${String(error_).slice(0, 100)}`);
      }
    }

    // Check for embedded errors — some providers return 200 with error in body
    if ((!fullText || fullText.trim() === "") && finishReason !== "tool-calls") {
      logError(`Stream completed but produced no content (finishReason: ${finishReason})`);
      throw new Error(`Stream completed but produced no content (finishReason: ${finishReason})`);
    }
    if (finishReason === "error") {
      logError(`Stream finished with error: ${streamErrorDetail || "unknown"} (text: ${fullText.length} chars)`);
      throw new Error(
        `Stream finished with error: ${streamErrorDetail || "unknown"} (text: ${fullText.length} chars)`,
      );
    }

    // Handle truncated responses — but distinguish between actual step limit vs API errors
    if (finishReason === "tool-calls") {
      const truncationNote =
        errorCount > 0
          ? "\n\n---\n⚠️ Response truncated: the stream ended during tool execution due to API error(s). The results above may be incomplete."
          : "\n\n---\n⚠️ Response truncated: the model was still working when it reached the tool-execution step limit. The results above may be incomplete.";
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
        logError(`Response contains embedded error`);
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

    // Build structured result contract for runner/agent consumption
    const _symphonyResult = {
      completed:
        executionMetrics.taskCompleted ||
        (finishReason === "stop" && errorCount === 0 && fullText.length > 0),
      needsContinuation: finishReason === "tool-calls" || finishReason === "length",
      failureClass:
        errorCount > 0
          ? "stream_error"
          : finishReason === "tool-calls"
            ? "step_limit_reached"
            : null,
      mutationCount: executionMetrics.mutationCount,
      changedFiles: [...executionMetrics.changedFiles],
      validationIntent: executionMetrics.validationToolsRun.size > 0,
      toolCallCount: executionMetrics.toolCallCount,
      stepCount: executionMetrics.stepCount,
    };

    return {
      text: fullText,
      providerName: provider.name,
      _symphonyResult,
    };
  } else {
    // Non-streaming with tool execution (tools disabled for providers that don't support them)
    const result = await generateText({
      model,
      messages: aiMessages,
      ...(useTools
        ? { tools: toolsProxy, toolChoice: "auto", stopWhen: stepCountIs(MAX_TOOL_ITERATIONS) }
        : {}),
    });

    let text = result.text || "";

    // Non-streaming: check if there were errors during generateText
    // Note: For non-streaming, we don't have per-event error tracking, but we can check
    // if the result.text indicates issues. The "tool-calls" finish reason on non-streaming
    // is more likely to be an actual step limit (generateText doesn't surface individual errors).
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

    // Build structured result contract (simplified for non-streaming - no tool execution metrics)
    const _symphonyResult = {
      completed: result.finishReason === "stop" && text.length > 0,
      needsContinuation: result.finishReason === "tool-calls" || result.finishReason === "length",
      failureClass: result.finishReason === "tool-calls" ? "step_limit_reached" : null,
      mutationCount: 0,
      changedFiles: [],
      validationIntent: false,
      toolCallCount: 0,
      stepCount: 0,
    };

    return {
      text,
      providerName: provider.name,
      usage: result.usage,
      _symphonyResult,
    };
  }
}

/**
 * Invoke with automatic fallback through all providers (non-streaming)
 */
async function invokeWithFallback(messages, route, sessionId = null, cwd = null) {
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
      let errorMsg;
      if (excludedByProbe.length > 0) {
        errorMsg = `No providers available for ${route.responseModelId} - ${excludedByProbe.join(", ")} excluded by tool-capability probe (non-tool-capable)`;
      } else if (lastError) {
        errorMsg = `All providers failed (tried ${triedProviders.join(", ")}). Last error: ${lastError}`;
      } else {
        errorMsg = `No providers available for ${route.responseModelId} - check env vars and provider failures`;
      }
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
      const result = await invokeWithAI(provider, messages, { stream: false, cwd });

      const durationMs = Date.now() - startedAt;
      const textPreview = result.text?.slice(0, 100) || "";
      logInfo(
        `✅ AI RESULT VALIDATION PASS: ${provider.name} (attempt ${attemptNumber}, ${durationMs}ms, ${result.text?.length || 0} chars)`,
      );
      logInfo(`   Preview: ${textPreview}`);
      recordProviderSuccess(provider.name);
      recordSuccessfulMetrics(provider.name, startedAt, result.usage, true);
      recordContextSuccess(provider.name);
      recordTokenUsage(provider.name, {
        inputTokens: estimateMessagesTokens(messages),
        outputTokens: Math.ceil((result.text?.length || 0) / 4),
      });

      // Update session state
      if (sessionId) {
        const mode =
          detectCodebuffMode(result) || (provider.name === "codebuff" ? "unknown" : null);
        updateSessionProvider(sessionId, { name: provider.name, mode, tier: provider.tier });
        // Store server-side message history for context verification on provider switches
        setSessionMessages(sessionId, messages);
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
        _symphonyResult: result._symphonyResult || null,
      };
    } catch (err) {
      const rootErr = unwrapAIError(err);
      const errStr = errorToString(rootErr === err ? err : rootErr);
      lastError = errStr;
      const isRetryable = isRetryableErrorDeep(err);
      logWarn(`❌ ${provider.name} failed (attempt ${attemptNumber}): ${errStr.slice(0, 200)}`, {
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

      // Adaptive context: classify error and update provider limits dynamically
      const errorType = classifyError(err);
      recordErrorType(provider.name, errorType);
      if (errorType === ERROR_TYPES.CONTEXT_TOO_LARGE) {
        const details = parseContextErrorDetails(err);
        recordContextError(provider.name, details);
      } else if (errorType === ERROR_TYPES.RATE_LIMITED) {
        const rlInfo = parseRateLimitInfo(err);
        recordRateLimit(provider.name, rlInfo);
      }

      // Clear sticky session immediately so concurrent requests on the same
      // session don't keep trying the failed provider.
      if (sessionId) {
        clearSessionProvider(sessionId);
        logInfo(`🔓 Cleared sticky session after ${provider.name} failure (${errorType})`);
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
 * Internal SDK activity patterns (complete markers to filter out of logs)
 */
const INTERNAL_PATTERNS = [
  /✅ set_messages done\n?/,
  /✅ spawn_agent_inline done\n?/,
  /✅ context-pruner done\n?/,
  /✅ end_turn done\n?/,
];

const LOG_BUFFER_THRESHOLD = 150; // Log when buffer exceeds ~150 chars

/**
 * Process SSE line and extract content for logging and streaming
 */
function processSSELine(line, state, onDiscordChunk) {
  const dataMatch = line.match(/^data: (.+)$/);
  if (!dataMatch) {
    return line;
  }

  if (dataMatch[1] === "[DONE]") {
    state.sawDone = true;
    return line;
  }

  try {
    const parsed = JSON.parse(dataMatch[1]);
    const choice = parsed.choices?.[0];
    const content = choice?.delta?.content;
    if (content && content.length > 0) {
      state.fullText += content;
      state.logBuffer += content; // Stream content to Discord (filter out standalone light bulb emoji)
      if (onDiscordChunk) {
        const trimmed = content.trim();
        const isLightbulb = trimmed === "💡" || content === "\n💡 ";
        if (!isLightbulb) {
          onDiscordChunk(content);
        }
      }

      maybeFlushLogBuffer(state);
    }

    const finishReason = choice?.finish_reason;
    if (finishReason) {
      state.finishReason = finishReason;
    }

    if (parsed._symphonyResult) {
      state.symphonyResult = parsed._symphonyResult;
    } else if (finishReason) {
      const inferred = inferSymphonyResultFromCompletion({
        finishReason,
        text: state.fullText,
      });
      if (inferred) {
        state.symphonyResult = inferred;
        parsed._symphonyResult = inferred;
        return `data: ${JSON.stringify(parsed)}`;
      }
    }
  } catch {
    // Parse error - ignore and forward the original line.
  }

  return line;
}

/**
 * Check if log buffer should be flushed and do so if needed
 */
function maybeFlushLogBuffer(state) {
  // Filter out internal activity markers for logging only
  let filteredLogBuffer = state.logBuffer;
  for (const pattern of INTERNAL_PATTERNS) {
    filteredLogBuffer = filteredLogBuffer.replace(pattern, "");
  }

  // Log when buffer exceeds threshold or contains sentence boundary
  const hasSentenceEnd = /[.!?]\s/.test(filteredLogBuffer) || filteredLogBuffer.includes("\n\n");
  if (filteredLogBuffer.length >= LOG_BUFFER_THRESHOLD || hasSentenceEnd) {
    const toLog = filteredLogBuffer.trim();
    if (toLog.length > 0) {
      logDebug(`🌊 ${toLog.slice(0, 200)}`);
    }
    state.logBuffer = ""; // Clear buffer after logging
  }
}

/**
 * Handle data chunk from proxy response
 */
function handleProxyDataChunk(chunk, res, state, onDiscordChunk) {
  state.partialBuffer += chunk.toString();
  const lines = state.partialBuffer.split("\n");
  state.partialBuffer = lines.pop() || "";

  for (const line of lines) {
    const transformed = processSSELine(line, state, onDiscordChunk);
    if (transformed === null) continue;
    res.write(`${transformed}\n`);
  }
}

/**
 * Handle proxy response end event
 */
async function handleProxyEnd(res, state, resolve) {
  if (state.partialBuffer.length > 0) {
    const transformed = processSSELine(state.partialBuffer, state, null);
    if (transformed !== null) {
      res.write(`${transformed}\n`);
    }
    state.partialBuffer = "";
  }

  // Log any remaining buffered text
  if (state.logBuffer.trim().length > 0) {
    logDebug(`🌊 ${state.logBuffer.trim().slice(0, 200)}`);
  }

  // Flush any remaining Discord stream buffer
  await flushDiscordStream({ emoji: "" }).catch(() => {
    /* ignore */
  });

  if (!state.sawDone) {
    if (state.symphonyResult && state.finishReason) {
      const finalChunk = {
        id: `chatcmpl-symphony-${Date.now()}`,
        object: "chat.completion.chunk",
        created: Math.floor(Date.now() / 1000),
        model: "codebuff/base",
        choices: [{ index: 0, delta: {}, finish_reason: state.finishReason }],
        _symphonyResult: state.symphonyResult,
      };
      res.write(`data: ${JSON.stringify(finalChunk)}\n\n`);
    }
    res.write("data: [DONE]\n\n");
  }

  logDebug(`🌊 Relay complete: ${state.fullText.length} chars`);
  resolve({
    text: state.fullText,
    providerName: "codebuff",
    finishReason: state.finishReason,
    _symphonyResult: state.symphonyResult,
  });
}

/**
 * Handle error response from proxy
 */
function handleErrorResponse(proxyRes, reject) {
  let errorBody = "";
  proxyRes.on("data", (chunk) => (errorBody += chunk));
  proxyRes.on("end", () => {
    reject(new Error(`Codebuff bridge returned ${proxyRes.statusCode}: ${errorBody}`));
  });
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
function invokeCodebuffDirectStream(messages, res, sessionId = null, onDiscordChunk = null, cwd = null) {
  return new Promise((resolve, reject) => {
    const requestBody = JSON.stringify({
      model: "codebuff/base",
      messages,
      cwd: cwd || getCurrentRequestCwd(),
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

    const state = {
      fullText: "",
      logBuffer: "",
      partialBuffer: "",
      finishReason: null,
      symphonyResult: null,
      sawDone: false,
    };

    const proxyReq = http.request(options, (proxyRes) => {
      if (proxyRes.statusCode !== 200) {
        handleErrorResponse(proxyRes, reject);
        return;
      }

      proxyRes.on("data", (chunk) => {
        handleProxyDataChunk(chunk, res, state, onDiscordChunk);
      });

      proxyRes.on("end", async () => {
        await handleProxyEnd(res, state, resolve);
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
  cwd = null,
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
      let errorMsg;
      if (excludedByProbe.length > 0) {
        errorMsg = `No providers available for ${route.responseModelId} - ${excludedByProbe.join(", ")} excluded by tool-capability probe (non-tool-capable)`;
      } else if (lastError) {
        errorMsg = `All streaming providers failed (tried ${triedProviders.join(", ")}). Last error: ${lastError}`;
      } else {
        errorMsg = `No providers available for ${route.responseModelId} - check env vars and provider failures`;
      }
      throw new Error(errorMsg);
    }
    logInfo(
      `${attemptNumber === 1 ? "🎯 PROVIDER SELECTED" : "🔄 FALLBACK ATTEMPT"}: ${provider.name} (${provider.model}) - attempt ${attemptNumber}`,
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
      const result = await invokeWithAI(provider, messages, { stream: true, onChunk, cwd });

      const textPreview = result.text?.slice(0, 100) || "";
      logInfo(
        `✅ AI RESULT VALIDATION PASS (streaming): ${provider.name} (attempt ${attemptNumber}, ${result.text?.length || 0} chars)`,
      );
      logInfo(`   Preview: ${textPreview}`);
      recordProviderSuccess(provider.name);
      recordSuccessfulMetrics(provider.name, startedAt, null, true);
      recordContextSuccess(provider.name);
      recordTokenUsage(provider.name, {
        inputTokens: estimateMessagesTokens(messages),
        outputTokens: Math.ceil((result.text?.length || 0) / 4),
      });

      // Update session state
      if (sessionId) {
        const mode =
          detectCodebuffMode(result) || (provider.name === "codebuff" ? "unknown" : null);
        updateSessionProvider(sessionId, { name: provider.name, mode, tier: provider.tier });
        // Store server-side message history for context verification on provider switches
        setSessionMessages(sessionId, messages);
      }

      requestCount++;
      probeTurnCounter++; // Track turns for probe triggering
      if (requestCount % STATS_LOG_INTERVAL === 0) {
        logBridgeStats();
      }

      // Trigger probe cycle if turn threshold reached OR 30 minutes elapsed
      const timeSinceProbe = Date.now() - lastProbeTimeCheck;
      const shouldProbeByTurns = probeTurnCounter >= PROBE_CYCLE_TURN_THRESHOLD;
      const shouldProbeByTime = timeSinceProbe >= PROBE_CYCLE_INTERVAL_MS;

      if (shouldProbeByTurns || shouldProbeByTime) {
        const reason = shouldProbeByTurns
          ? `turn threshold (${probeTurnCounter}/${PROBE_CYCLE_TURN_THRESHOLD})`
          : `time threshold (${Math.round(timeSinceProbe / 60000)}min / 30min)`;
        logInfo(`🔍 Probe trigger: ${reason}, scheduling probe cycle...`);
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
        _symphonyResult: result._symphonyResult || null,
      };
    } catch (err) {
      const rootErr = unwrapAIError(err);
      const errStr = errorToString(rootErr === err ? err : rootErr);
      lastError = errStr;
      logWarn(
        `❌ Streaming ${provider.name} failed (attempt ${attemptNumber}): ${errStr.slice(0, 200)}`,
      );

      if (isRetryableErrorDeep(err)) {
        recordProviderFailure(provider.name);
        recordProviderFailureCount(provider.name);
      }

      // Adaptive context: classify error and update provider limits dynamically
      const errorType = classifyError(err);
      recordErrorType(provider.name, errorType);
      if (errorType === ERROR_TYPES.CONTEXT_TOO_LARGE) {
        const details = parseContextErrorDetails(err);
        recordContextError(provider.name, details);
      } else if (errorType === ERROR_TYPES.RATE_LIMITED) {
        const rlInfo = parseRateLimitInfo(err);
        recordRateLimit(provider.name, rlInfo);
      }

      // Clear sticky session immediately so concurrent requests on the same
      // session don't keep trying the failed provider. The next call to
      // buildSelectionOptions will see no sticky and allow all providers.
      if (sessionId) {
        clearSessionProvider(sessionId);
        logInfo(
          `🔓 Cleared sticky session after ${provider.name} streaming failure (${errorType})`,
        );
      }

      // Send error notification to client (but don't end the stream yet)
      if (onChunk) {
        // Include actual error details when errorType is generic/unknown
        const errorDetail = (errorType === ERROR_TYPES.UNKNOWN || errorType === "unknown") ? errStr.slice(0, 100) : errorType;
        const errorNotice = `\n⚠️ ${provider.name} failed (${errorDetail}), trying next provider...\n`;
        onChunk({ type: "text", text: errorNotice });
      }

      // Continue to next provider in the loop
      continue;
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

      const adaptiveContext = getAdaptiveStats();

      // Include concurrent request count and details
      const concurrentRequests = {
        count: activeRequests.size,
        requests: Array.from(activeRequests.entries()).map(([id, req]) => ({
          id,
          issueId: req.issueId,
          model: req.model,
          stream: req.stream,
          filesChanged: req.filesChanged,
          runtimeMs: Date.now() - req.startTime,
          requestPreview: req.requestText?.slice(0, 100) || "(no description)",
        })),
      };

      return sendJson(res, 200, {
        rankedProviders: ranked,
        providerStats: stats,
        adaptiveContext,
        concurrentRequests,
      });
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

    // POST /v1/stats/reset — reset all provider stats (operational use)
    if (req.method === "POST" && req.url === "/v1/stats/reset") {
      logInfo(`🔄 Stats reset requested via API`);
      resetProviderStats();
      return sendJson(res, 200, {
        status: "reset",
        message:
          "Provider stats have been reset. Fresh metrics will accumulate from new probes and requests.",
        timestamp: new Date().toISOString(),
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
      } catch (error_) {
        logWarn(`⚠️ Request parse error: ${error_.message}`);
        return sendJson(res, 400, {
          error: {
            message: "Invalid request body: not valid JSON",
            type: "invalid_request_error",
          },
        });
      }

      const messages = Array.isArray(body.messages) ? body.messages : undefined;
      const sessionId = req.headers["x-openclaw-session"] || null;
      const worktreeId = req.headers["x-worktree-id"] || null;
      const requestCwd = normalizeRequestCwd(body.cwd);

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
      if (activeRequests.size >= MAX_CONCURRENT_REQUESTS) {
        return sendJson(res, 429, { error: { message: "Too many concurrent requests. Please try again later." } });
      }
      activeRequests.set(requestId, {
        startTime,
        issueId: issueContext?.identifier || null,
        requestText: contentStr.slice(0, 200),
        model: route.responseModelId,
        stream,
        filesChanged: 0,
        worktreeId: worktreeId || null,
      });

      // Fire-and-forget Discord notification (non-blocking)
      const concurrentCount = activeRequests.size - 1; // Exclude current request
      const concurrentRequests = Array.from(activeRequests.values()).filter(
        (r) => r.startTime !== startTime, // Exclude current request
      );

      const fields = [];

      // Add worktree context if available
      if (worktreeId) {
        fields.push({
          name: "Worktree",
          value: worktreeId,
          inline: true,
        });
      }

      // Read in-progress issues from symphony state
      let inProgressIssues = [];
      try {
        const { loadState, leaseIsActive } = await import("../../core/symphony-state.mjs");
        const state = loadState();
        const now = Date.now();
        inProgressIssues = Object.entries(state.issues)
          .filter(([_, record]) => leaseIsActive(record, now))
          .map(([issueIdentifier, record]) => ({
            issueIdentifier,
            owner: record.lease?.owner || "unknown",
            runId: record.lease?.run_id || null,
          }));
      } catch (err) {
        logDebug(`Failed to read in-progress issues from state: ${err.message}`);
      }

      // Show in-progress issues from state (if any)
      if (inProgressIssues.length > 0) {
        const inProgressText = inProgressIssues
          .slice(0, 5)
          .map((item) => `${item.issueIdentifier} (${item.owner})`)
          .join("\n");
        const remainingCount = inProgressIssues.length - 5;
        const finalText =
          remainingCount > 0 ? `${inProgressText}\n...and ${remainingCount} more` : inProgressText;

        fields.push({
          name: `In Progress (${inProgressIssues.length})`,
          value: finalText,
          inline: false,
        });
      }

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
          name: `Bridge Active (${concurrentCount})`,
          value: concurrentText,
          inline: false,
        });
      }

      // Build message preview for Discord notifications
      const messagePreview = contentStr.slice(0, 150) + (contentStr.length > 150 ? '...' : '');
      // Build title with worktree ID
      const worktreeLabel = worktreeId ? ` | ${worktreeId}` : "";
      const embedTitle = issueContext?.identifier 
        ? `⏳ ${issueContext.identifier}${worktreeLabel}` 
        : `⏳ Processing Request${worktreeLabel}`;
      const embedDescription = issueContext?.title 
        ? issueContext.title 
        : messagePreview || "(no description)";
      
      // Add message preview field if no Linear issue
      if (!issueContext?.identifier && messagePreview) {
        fields.push({
          name: "Message",
          value: messagePreview,
          inline: false,
        });
      }
      
      sendDiscordEmbed({
        title: embedTitle,
        description: embedDescription,
        color: 0xffa500, // Orange
        fields,
      }).catch((err) => safeLogDebug(`Discord webhook failed: ${err.message}`));

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
              _symphonyResult: {
                completed: false,
                failureClass: "timeout",
                stepCount: 0,
                toolCallCount: 0,
                needsContinuation: false,
              },
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
            // Skip for Discord-originated requests — the Discord command handler
            // already streams text from the SSE response to avoid double delivery.
            const isDiscordOrigin = sessionId?.startsWith("discord:");
            const streamToDiscord = isDiscordOrigin
              ? null
              : (text) => {
                  if (text && text.length > 0) {
                    // Filter out internal activity markers to avoid duplicate messages in Discord
                    const isActivityMarker = /^🔧\s+\w+:?\s*$|^✅\s+\w+\s+done\s*$/;
                    // Filter out standalone light bulb emoji from Discord notifications
                    const trimmed = text.trim();
                    const isLightbulb = trimmed === "💡" || text === "\n💡 " || text === "💡 ";
                    if (!isActivityMarker.test(trimmed) && !isLightbulb) {
                      streamDiscordUpdate(text, { emoji: "", requestId }).catch(() => {
                        /* ignore */
                      });
                    }
                  }
                };

            const result = await invokeCodebuffDirectStream(
              messages,
              res,
              sessionId,
              streamToDiscord,
              requestCwd,
            );

            clearInterval(heartbeat);
            clearInterval(progressInterval);
            clearTimeout(requestTimeoutHandle);

            if (!res.writableEnded) {
              res.end();
            }

            // Clean up request tracking
            activeRequests.delete(requestId);
            setCurrentRequestId(null);

            logInfo(
              `✅ Finished: ${issueContext?.identifier || "Request"} (provider: codebuff, ${result.text.length} chars)`,
            );

          // Send comprehensive completion metrics (non-blocking)
          const completionFields = [
            { name: "Issue", value: issueContext?.identifier || "N/A", inline: true },
            { name: "Output", value: `${result.text.length} chars`, inline: true },
            { name: "Model", value: "codebuff", inline: true },
          ];
          if (worktreeId) {
            completionFields.push({ name: "Worktree", value: worktreeId, inline: true });
          }
          const completionWorktreeLabel = worktreeId ? ` | ${worktreeId}` : "";
          const completionTitle = issueContext?.identifier 
            ? `✅ ${issueContext.identifier}${completionWorktreeLabel}` 
            : `✅ Completed Request${completionWorktreeLabel}`;
          sendDiscordEmbed({
            title: completionTitle,
            description: issueContext?.title || contentStr.slice(0, 150) || "(no description)",
            color: 0x00ff00, // Green
            fields: completionFields,
          }).catch((err) => safeLogDebug(`Discord webhook failed: ${err.message}`));

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
              // Store server-side message history for context verification on provider switches
              setSessionMessages(sessionId, messages);
            }
            maybeGC();
            return;
          } catch (error_) {
            const errMsg = String(error_.message || error_).slice(0, 200);
            logWarn(`⚠️ Codebuff transparent relay failed: ${errMsg}`);

            // Record failure and fall through to standard cascade
            if (isRetryableErrorDeep(error_)) {
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
            requestCwd,
          );

          clearInterval(heartbeat);
          clearInterval(progressInterval);
          clearTimeout(requestTimeoutHandle);

          // Send final chunk (includes structured result for runner/agent consumption)
          const finalChunk = {
            id: completionId,
            object: "chat.completion.chunk",
            created,
            model: route.responseModelId,
            choices: [{ index: 0, delta: {}, finish_reason: "stop" }],
            _symphonyResult: result._symphonyResult || null,
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
          const streamCompletionFields = [
            { name: "Issue", value: issueContext?.identifier || "N/A", inline: true },
            { name: "Output", value: `${result.text.length} chars`, inline: true },
            { name: "Model", value: result.providerName, inline: true },
          ];
          if (worktreeId) {
            streamCompletionFields.push({ name: "Worktree", value: worktreeId, inline: true });
          }
          const streamCompletionWorktreeLabel = worktreeId ? ` | ${worktreeId}` : "";
          const streamCompletionTitle = issueContext?.identifier 
            ? `✅ ${issueContext.identifier}${streamCompletionWorktreeLabel}` 
            : `✅ Completed Request${streamCompletionWorktreeLabel}`;
          sendDiscordEmbed({
            title: streamCompletionTitle,
            description: issueContext?.title || contentStr.slice(0, 150) || "(no description)",
            color: 0x00ff00, // Green
            fields: streamCompletionFields,
          }).catch((err) => safeLogDebug(`Discord webhook failed: ${err.message}`));

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
            _symphonyResult: {
              completed: false,
              failureClass: "stream_error",
              stepCount: 0,
              toolCallCount: 0,
              needsContinuation: false,
            },
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
          result = await invokeWithFallback(messages, route, sessionId, requestCwd);
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

        const nonStreamCompletionFields = [
          { name: "Issue", value: issueContext?.identifier || "N/A", inline: true },
          {
            name: "Output",
            value: totalTokens > 0 ? `${totalTokens} tokens` : `${resultText.length} chars`,
            inline: true,
          },
          { name: "Model", value: result.providerName, inline: true },
        ];
        if (worktreeId) {
          nonStreamCompletionFields.push({ name: "Worktree", value: worktreeId, inline: true });
        }
        const nonStreamCompletionWorktreeLabel = worktreeId ? ` | ${worktreeId}` : "";
        const nonStreamCompletionTitle = issueContext?.identifier 
          ? `✅ ${issueContext.identifier}${nonStreamCompletionWorktreeLabel}` 
          : `✅ Completed Request${nonStreamCompletionWorktreeLabel}`;
        sendDiscordEmbed({
          title: nonStreamCompletionTitle,
          description: issueContext?.title || contentStr.slice(0, 150) || "(no description)",
          color: 0x00ff00, // Green
          fields: nonStreamCompletionFields,
        }).catch((err) => safeLogDebug(`Discord webhook failed: ${err.message}`));

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
          _symphonyResult: result._symphonyResult || null,
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
      const fallbackModelId = typeof route === "undefined" ? MODEL_ID : route.responseModelId;
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
          _symphonyResult: {
            completed: false,
            failureClass: "server_error",
            stepCount: 0,
            toolCallCount: 0,
            needsContinuation: false,
          },
        };
        res.write(`data: ${JSON.stringify(errorChunk)}\n\n`);
        res.write("data: [DONE]\n\n");
        res.end();
        return;
      } catch (error_) {
        logError(`Failed to send error chunk: ${error_.message}`);
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

  // Don't send shutdown notification - will send combined restart message on startup

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
  logInfo(`Bridge root: ${BRIDGE_ROOT}`);
  if (IS_WORKTREE_BRIDGE) {
    logInfo(`Worktree bridge isolation active: repo paths remap into ${BRIDGE_ROOT}`);
    logInfo(`Control-plane checkout detected at: ${CONTROL_REPO_ROOT}`);
  }

  const RETRIEVAL_WARMUP_ENABLED = process.env.ANQR_RETRIEVAL_WARMUP !== "false";
  let warmupSummary = { bm25: "skipped", vector: "skipped", linear: "skipped" };

  if (RETRIEVAL_WARMUP_ENABLED) {
    try {
      const [bm25Result, vectorResult, linearResult] = await Promise.allSettled([
        warmSearchIndex({ rootDir: process.cwd() }),
        getVectorIndexStats(),
        warmLinearIndex(),
      ]);

      const bm25Status = bm25Result.value.rebuilt ? " (rebuilt)" : " (cached)";
      warmupSummary = {
        bm25:
          bm25Result.status === "fulfilled"
            ? `${bm25Result.value.documentCount} docs${bm25Status}`
            : `error: ${bm25Result.reason?.message || bm25Result.reason}`,
        vector:
          vectorResult.status === "fulfilled"
            ? `${vectorResult.value.totalEntries} entries / ${vectorResult.value.totalFiles} files`
            : `error: ${vectorResult.reason?.message || vectorResult.reason}`,
        linear:
          linearResult.status === "fulfilled"
            ? `${linearResult.value.length} indexed issues`
            : `error: ${linearResult.reason?.message || linearResult.reason}`,
      };
    } catch {
      // best effort only
    }
  }

  const ragStats = getHybridSearchStats();
  const linearStats = getLinearIndexStats();
  let context7StartupStatus = "unreachable";
  try {
    const res = await fetch(`${CONTEXT7_HTTP_BASE}/health`, {
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = await res.json();
      context7StartupStatus = data.status || "ok";
    }
  } catch {
    // best effort only; detailed startup probe below already handles fallback messaging
  }

  logInfo(`========================================`);
  logInfo(`Symphony OpenAI Bridge Starting`);
  logInfo(`========================================`);
  logInfo(`Listening: http://127.0.0.1:${PORT}/v1`);
  logInfo(`Model: ${MODEL_ID}`);
  logInfo(`Auth token: Bearer ${API_KEY.slice(0, 10)}...`);
  logInfo(`Streaming: enabled`);
  logInfo(`Auto-fallback: enabled (credit-gate)`);
  logInfo(`Context7: ${context7StartupStatus} via ${CONTEXT7_HTTP_BASE}`);
  logInfo(
    `Hybrid RAG: indexed=${ragStats.indexed} docs=${ragStats.documentCount} builtAt=${ragStats.builtAt || "n/a"} embeddings=${ragStats.embeddingsAvailable} vectorStore=${ragStats.vectorStoreReady}`,
  );
  logInfo(
    `Linear RAG: ready=${linearStats.ready} entries=${linearStats.entries ?? 0} builtAt=${linearStats.builtAt || "n/a"}`,
  );
  logInfo(
    `Retrieval warmup: bm25=${warmupSummary.bm25} | vector=${warmupSummary.vector} | linear=${warmupSummary.linear} | enabled=${RETRIEVAL_WARMUP_ENABLED}`,
  );
  logInfo(`Tools available: ${Object.keys(tools).join(", ")}`);
  logInfo(`========================================`);

  // Startup self-test: verify ALL array parameter tools accept both string and array input
  {
    const selfTests = [
      // run_file_change_hooks
      { tool: "run_file_change_hooks", name: "files_array", input: { files: ["test.txt"] } },
      { tool: "run_file_change_hooks", name: "files_string", input: { files: "test.txt" } },
      {
        tool: "run_file_change_hooks",
        name: "files_json_array",
        input: { files: '["file1.ts", "file2.ts"]' },
      },
      { tool: "run_file_change_hooks", name: "files_empty_string", input: { files: "" } },
      {
        tool: "run_file_change_hooks",
        name: "files_object_path",
        input: { files: { path: "test.ts" } },
      },

      // read_files
      { tool: "read_files", name: "paths_array", input: { paths: ["package.json"] } },
      { tool: "read_files", name: "paths_string", input: { paths: "package.json" } },
      { tool: "read_files", name: "paths_json_array", input: { paths: '["package.json"]' } },

      // str_replace
      {
        tool: "str_replace",
        name: "replacements_array",
        input: { path: "test.txt", replacements: [{ old: "a", new: "b" }] },
      },
      {
        tool: "str_replace",
        name: "replacements_object",
        input: { path: "test.txt", replacements: { old: "a", new: "b" } },
      },
      {
        tool: "str_replace",
        name: "replacements_json",
        input: { path: "test.txt", replacements: '[{"old":"a","new":"b"}]' },
      },

      // spawn_agents
      { tool: "spawn_agents", name: "agents_array", input: { agents: [{ agent_type: "test" }] } },
      { tool: "spawn_agents", name: "agents_object", input: { agents: { agent_type: "test" } } },
      { tool: "spawn_agents", name: "agents_json", input: { agents: '[{"agent_type":"test"}]' } },

      // read_subtree
      { tool: "read_subtree", name: "paths_array", input: { paths: ["."] } },
      { tool: "read_subtree", name: "paths_string", input: { paths: "." } },
      { tool: "read_subtree", name: "maxTokens_number", input: { maxTokens: 1000 } },
      { tool: "read_subtree", name: "maxTokens_string", input: { maxTokens: "1000" } },

      // run_terminal_command (Codebuff-native alias)
      { tool: "run_terminal_command", name: "basic", input: { command: "echo hello" } },
      { tool: "run_terminal_command", name: "with_cwd", input: { command: "ls", cwd: "." } },
      {
        tool: "run_terminal_command",
        name: "with_timeout_number",
        input: { command: "echo hi", timeout_seconds: 30 },
      },
      {
        tool: "run_terminal_command",
        name: "with_timeout_string",
        input: { command: "echo hi", timeout_seconds: "30" },
      },

      // write_file (Codebuff-native alias)
      { tool: "write_file", name: "basic", input: { path: "test.txt", content: "hello" } },
      {
        tool: "write_file",
        name: "with_instructions",
        input: { path: "test.txt", instructions: "Create a test", content: "hello" },
      },

      // Cross-provider compatibility tools
      { tool: "shell", name: "basic", input: { command: "echo test" } },
      { tool: "local_shell", name: "basic", input: { command: "echo test" } },
      { tool: "thinker", name: "with_thought", input: { thought: "thinking..." } },
      { tool: "thinker", name: "with_prompt", input: { prompt: "thinking..." } },
      { tool: "message", name: "basic", input: { content: "hello" } },
      { tool: "code_interpreter", name: "with_code", input: { code: "print(1+1)" } },
      { tool: "code_interpreter", name: "with_command", input: { command: "echo test" } },
      { tool: "file_search", name: "with_query", input: { query: "test" } },
      { tool: "file_search", name: "with_prompt", input: { prompt: "find config files" } },
      { tool: "browser_search", name: "basic", input: { query: "test" } },
      { tool: "visit_website", name: "with_url", input: { url: "https://example.com" } },
      { tool: "end_turn", name: "basic", input: {} },

      // No-op tools (verify schemas parse without error)
      { tool: "image_generation", name: "basic", input: { prompt: "a cat" } },
      { tool: "wolfram_alpha", name: "basic", input: { query: "2+2" } },
      { tool: "tts", name: "basic", input: { text: "hello" } },
      { tool: "browser_automation", name: "basic", input: { action: "click" } },
      { tool: "computer_use", name: "basic", input: { action: "screenshot" } },
      { tool: "mcp_list_tools", name: "basic", input: {} },
    ];

    // Verify catch-all proxy returns a tool for unknown names
    // (the proxy emits a logWarn for unknown tool access — expected during self-test)
    const catchAllTool = toolsProxy["completely_hallucinated_tool_name_xyz"];
    if (!catchAllTool || !catchAllTool.execute) {
      logError(`❌ Catch-all proxy self-test FAILED: did not return a tool for unknown name`);
      process.exit(1);
    }
    // Verify known tools still pass through the proxy
    if (toolsProxy["exec"] !== tools["exec"]) {
      logError(`❌ Catch-all proxy self-test FAILED: known tool "exec" was not passed through`);
      process.exit(1);
    }
    // Verify Object.keys only returns known tools (proxy doesn't leak catch-all names)
    if (Object.keys(toolsProxy).length !== Object.keys(tools).length) {
      logError(`❌ Catch-all proxy self-test FAILED: Object.keys(toolsProxy) leaked unknown tools`);
      process.exit(1);
    }
    logInfo(
      `🧪 Catch-all proxy self-test: passed (unknown tools return graceful no-op, known tools pass through)`,
    );

    let selfTestPassed = 0;
    const failedTests = [];

    for (const { tool: toolName, name, input } of selfTests) {
      try {
        // Validate using the tool schema directly (doesn't execute, just validates)
        const toolDef = tools[toolName];
        if (!toolDef) {
          logError(`❌ Schema self-test FAILED: ${toolName}/${name} — tool not found`);
          failedTests.push(`${toolName}/${name}: tool not found`);
          continue;
        }

        // Parse input through the schema
        const parsed = await toolDef.inputSchema.parseAsync(input);

        // Verify array normalization worked correctly
        if (toolName === "run_file_change_hooks" || toolName === "read_files") {
          const key = toolName === "run_file_change_hooks" ? "files" : "paths";
          if (!Array.isArray(parsed[key])) {
            throw new TypeError(`Expected ${key} to be normalized to array, got ${typeof parsed[key]}`);
          }
        }

        selfTestPassed++;
        logDebug(`✅ Schema test passed: ${toolName}/${name}`);
      } catch (err) {
        logError(`❌ Schema self-test FAILED: ${toolName}/${name} — ${err.message}`);
        failedTests.push(`${toolName}/${name}: ${err.message}`);
      }
    }

    if (selfTestPassed < selfTests.length) {
      logError(
        `🧪 Tool schema self-test FAILED (${selfTestPassed}/${selfTests.length}) — refusing to start`,
      );
      logError(`Failed tests:`);
      for (const failure of failedTests) {
        logError(`  - ${failure}`);
      }
      process.exit(1);
    }
    logInfo(
      `🧪 Tool schema self-test: ${selfTestPassed}/${selfTests.length} passed (all array normalization working)`,
    );
  }

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
      title: "🔄 Symphony Bridge Restarted",
      description: `PID ${process.pid}`,
      color: 0x00ff00, // Green
      fields,
    });
    if (discordResult.sent) {
      logInfo(`✅ Discord restart notification sent successfully`);
    } else {
      logError(`❌ Discord restart notification failed: ${discordResult.reason || "unknown"}`);
    }
  } catch (err) {
    logError(`❌ Failed to send Discord restart notification: ${err.message}`);
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

  // Startup exploration: run 1 complete probe cycle (reachability → tool probe)
  // This builds initial ranking before accepting any requests
  // Background probe will continue to refine rankings over time
  (async () => {
    try {
      logInfo(`🔍 Starting startup exploration (1 cycle)...`);

      for (let cycle = 1; cycle <= 1; cycle++) {
        logInfo(`========================================`);
        logInfo(`🔍 Startup Probe Cycle ${cycle}/1`);
        logInfo(`========================================`);

        // Phase 1: Reachability probe (knock out unreachable providers)
        await refreshProviderStatus();
        const available = providerStatusCache.probeResults.filter((r) => r.available);
        const total = providerStatusCache.configured.length;
        logInfo(`✅ Reachability: ${available.length}/${total} providers available`);

        // Brief summary of reachability results
        for (const p of providerStatusCache.probeResults.filter((r) => r.status !== "excluded")) {
          const icon = p.available ? "✅" : "❌";
          logInfo(`  ${icon} ${p.name}: ${p.status}`);
        }

        // Phase 2: Tool probe (on remaining providers)
        // probeAllToolCapability() already called by refreshProviderStatus()
        const toolCapable = toolCapableProviders.size;
        const toolExcluded = nonToolCapableProviders.size;
        const unclassified = available
          .map((r) => r.name)
          .filter((n) => !toolCapableProviders.has(n) && !nonToolCapableProviders.has(n));

        logInfo(
          `🔧 Tool probe: ${toolCapable} capable | ${toolExcluded} excluded | ${unclassified.length} unclassified`,
        );

        // No delay needed - single cycle only
      }

      // Final summary after all 3 cycles
      const available = providerStatusCache.probeResults.filter((r) => r.available);
      const total = providerStatusCache.configured.length;
      logInfo(`========================================`);
      logInfo(`Startup exploration complete (1 cycle)`);
      logInfo(`========================================`);
      logInfo(`Final status: ${available.length}/${total} providers available`);

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

      // SKIP: Don't send Discord notifications during startup probe
      // Sending probe results to Discord creates bridge requests that trigger more probes
      // causing a feedback loop that leads to OOM
      // Provider rankings are logged server-side in the summary above
      logInfo(`📊 Startup probe complete - rankings logged server-side (not sent to Discord)`);

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
    } catch (err) {
      logError(`Startup probe failed: ${err.message}`);
      logInfo(`========================================`);
      logInfo(`Ready to accept requests (probe incomplete)`);
      logInfo(`========================================`);
    }
  })();

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

  // Start continuous probe IMMEDIATELY on startup (alongside initial cache)
  scheduleContinuousProbe(0);

  // Verify Context7 HTTP service reachability (non-blocking)
  fetch(`${CONTEXT7_HTTP_BASE}/health`, { signal: AbortSignal.timeout(5000) })
    .then((res) => res.json())
    .then((data) => {
      if (data.serverReady) {
        logInfo(`✅ Context7 HTTP service reachable (uptime: ${data.uptime}s)`);
      } else {
        logWarn(`⚠️ Context7 HTTP service degraded — will use cloud API fallback`);
      }
    })
    .catch(() => {
      logWarn(
        `⚠️ Context7 HTTP service not reachable at ${CONTEXT7_HTTP_BASE} — will use cloud API fallback`,
      );
    });

  // Start Discord message monitoring
  startDiscordMonitoring();

  // Start periodic processing status updates
  startProcessingStatusUpdates();

  // NOTE: Runner timer management removed from bridge startup.
  // Bridge startup must NOT have side effects on runner timers.
  // Use symphony-control.mjs --start/--stop to manage runners independently.
  // See: External review finding F3 — starting a worktree bridge was
  // re-enabling runner timers, including wrong-scope runners.
  logInfo(`ℹ️  Runner timers are managed separately via symphony-control.mjs`);
});

// Export for testing
export {
  invokeWithFallback,
  invokeWithFallbackStream,
  MODEL_ID,
  toolsProxy as tools,
  // Export individual tool functions for testing
  execTool,
  readFilesTool,
  strReplaceTool,
  writeFileTool,
  readFileTool,
  codeSearchTool,
  globTool,
  listDirectoryTool,
  readSubtreeTool,
  memorySearchTool,
  memoryGetTool,
  runFileChangeHooksTool,
  thinkDeeplyTool,
  updateSubgoalTool,
  addSubgoalTool,
  spawnAgentsTool,
  proposeStrReplaceTool,
  proposeWriteFileTool,
  addMessageTool,
  setMessagesTool,
  askUserTool,
  lookupAgentInfoTool,
  applyPatchTool,
  webSearchTool,
  readDocsTool,
};
