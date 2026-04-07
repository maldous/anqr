import fs from "node:fs";
import http from "node:http";
import {
  selectProvider,
  recordProviderFailure,
  recordProviderFailureCount,
  recordProviderSuccess,
  getProviderStats,
  getRankedProviders,
  resetProviderStats,
} from "../symphony-credit-gate.mjs";
import { saveHealthState } from "../symphony-provider-health.mjs";
import { getAdaptiveStats } from "../symphony-adaptive-context.mjs";
import { streamDiscordUpdate, sendDiscordEmbed } from "../../notifications/openclaw-discord.mjs";
import { updateSessionProvider, setSessionMessages } from "../symphony-session-state.mjs";

import { ADVERTISED_MODELS } from "./advertised-models.mjs";
import { BRIDGE_METRICS } from "./bridge-metrics.mjs";
import { PROBE_CACHE_FILE } from "./probe-cache-file.mjs";
import { BRIDGE_PROVIDER_BLOCKLIST } from "./bridge-provider-blocklist.mjs";
import { BRIDGE_PROVIDER_BLOCKLIST_REASONS } from "./bridge-provider-blocklist-reasons.mjs";
import { MAX_CONCURRENT_REQUESTS } from "./max-concurrent-requests.mjs";
import { MODEL_ID } from "./model-id.mjs";
import { REQUEST_TIMEOUT_MS } from "./request-timeout-ms.mjs";
import { VOICE_SYSTEM_PROMPT } from "./voice-system-prompt.mjs";
import { VOICE_TRANSCRIPT_RE } from "./voice-transcript-re.mjs";
import { activeRequests } from "./active-requests.mjs";
import { buildSelectionOptions } from "./build-selection-options.mjs";
import { checkAuth } from "./check-auth.mjs";
import { ensureString } from "./ensure-string.mjs";
import { executeLinearIssueRequest } from "./execute-linear-issue-request.mjs";
import { finalizeWorktreeRequest } from "./finalize-worktree-request.mjs";
import { formatElapsed } from "./format-elapsed.mjs";
import { invokeCodebuffDirectStreamToSSE } from "./invoke-codebuff-direct-stream-to-sse.mjs";
import { invokeWithFallback } from "./invoke-with-fallback.mjs";
import { invokeWithFallbackStream } from "./invoke-with-fallback-stream.mjs";
import { isRetryableErrorDeep } from "./is-retryable-error-deep.mjs";
import { logMemory } from "./log-memory.mjs";
import { maybeGC } from "./maybe-gc.mjs";
import { nonToolCapableProviders } from "./non-tool-capable-providers.mjs";
import { normalizeRequestCwd } from "./normalize-request-cwd.mjs";
import { parseBody } from "./parse-body.mjs";
import { providerStatusCache } from "./provider-status-cache.mjs";
import { recordBridgeMetrics } from "./record-bridge-metrics.mjs";
import { recordSuccessfulMetrics } from "./record-successful-metrics.mjs";
import { refreshProviderStatus } from "./refresh-provider-status.mjs";
import { requestIdCounter, setRequestIdCounter } from "./request-id-counter.mjs";
import { resolveRoute } from "./resolve-route.mjs";
import { safeLogDebug } from "./safe-log-debug.mjs";
import { sanitizeForDiscordPreview } from "./sanitize-for-discord-preview.mjs";
import { sendJson } from "./send-json.mjs";
import { shouldUseToolsForRequest } from "./should-use-tools-for-request.mjs";
import { setCurrentRequestId } from "./set-current-request-id.mjs";
import { toolCapableProviders } from "./tool-capable-providers.mjs";
import { tools } from "./tools.mjs";
import { unauthorized } from "./unauthorized.mjs";
import { verifyWorktreeFreshnessNonBlocking } from "./verify-worktree-freshness-non-blocking.mjs";
import { voiceAnnounce } from "./voice-announce.mjs";
import { logDebug, logInfo, logWarn, logError } from "./logger.mjs";

export const server = http.createServer(async (req, res) => {
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
          requestPreview: req.requestText || "request in progress",
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

    // POST /v1/stats/reset — reset all provider stats, health state, and probe cache
    if (req.method === "POST" && req.url === "/v1/stats/reset") {
      logInfo(`🔄 Full stats reset requested via API`);
      resetProviderStats();
      saveHealthState({});
      logInfo(`🔄 Provider health state cleared`);
      try {
        if (fs.existsSync(PROBE_CACHE_FILE)) {
          fs.unlinkSync(PROBE_CACHE_FILE);
          logInfo(`🔄 Probe cache deleted`);
        }
      } catch (err) {
        logWarn(`Failed to delete probe cache: ${err.message}`);
      }
      return sendJson(res, 200, {
        status: "reset",
        message:
          "Provider stats, health state, and probe cache have been reset. Run /v1/providers/refresh for a full re-probe.",
        timestamp: new Date().toISOString(),
      });
    }

    // POST /v1/providers/refresh — manually trigger a provider re-probe (synchronous)
    if (req.method === "POST" && req.url === "/v1/providers/refresh") {
      req.setTimeout(0); // Probing 600+ providers can take minutes
      if (providerStatusCache.probing) {
        return sendJson(res, 200, {
          status: "already_probing",
          message: "A probe is already in progress. Check /v1/providers for current results.",
        });
      }
      try {
        await refreshProviderStatus({ force: true });
        const available = providerStatusCache.probeResults.filter((r) => r.available).length;
        const total = providerStatusCache.configured.length;
        return sendJson(res, 200, {
          status: "refreshed",
          available,
          total,
          message: `Probe complete: ${available}/${total} providers available`,
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        logError(`Manual probe error: ${err.message}`);
        return sendJson(res, 500, {
          status: "error",
          message: `Probe failed: ${err.message}`,
        });
      }
    }

    if (req.method === "POST" && req.url === "/v1/linear/execute") {
      return executeLinearIssueRequest(req, res);
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
      const isSymphonyRunner = req.headers["x-symphony-origin"] === "runner";
      const requestCwd = normalizeRequestCwd(body.cwd);

      // Extract Discord message ID, thread name, and Linear thread name for thread/reply functionality
      const discordMessageId = req.headers["x-discord-message-id"] || null;
      const discordThreadNameRaw = req.headers["x-discord-thread-name"] || null;
      const discordThreadName = discordThreadNameRaw
        ? decodeURIComponent(discordThreadNameRaw)
        : null;
      const linearThreadName = req.headers["x-linear-thread-name"] || null;
      const discordSource = discordMessageId
        ? "discord"
        : discordThreadName
          ? "discord"
          : linearThreadName
            ? "linear"
            : null;
      const discordOptions = {};
      if (discordMessageId) discordOptions.replyTo = discordMessageId;
      if (discordThreadName) discordOptions.threadName = discordThreadName;
      else if (linearThreadName) discordOptions.threadName = linearThreadName;
      if (discordSource) discordOptions.source = discordSource;

      // Verify worktree freshness (non-blocking, no merge/rebase)
      await verifyWorktreeFreshnessNonBlocking();

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
          logError(`❌ VALIDATION: message[${i}].role is missing`, {
            messageIndex: i,
            message: msg,
          });
          return sendJson(res, 400, {
            error: {
              message: `Invalid request: message[${i}].role is required`,
              type: "invalid_request_error",
              param: `messages[${i}].role`,
            },
          });
        }
        if (msg.content === undefined) {
          logError(`❌ VALIDATION: message[${i}].content is undefined (role: ${msg.role})`, {
            messageIndex: i,
            role: msg.role,
            message: msg,
          });
          return sendJson(res, 400, {
            error: {
              message: `Invalid request: message[${i}].content is required (cannot be undefined)`,
              type: "invalid_request_error",
              param: `messages[${i}].content`,
            },
          });
        }
        // Additional validation: content must be string or array (not null, not object)
        if (
          msg.content !== null &&
          typeof msg.content !== "string" &&
          !Array.isArray(msg.content)
        ) {
          logError(
            `❌ VALIDATION: message[${i}].content has invalid type (role: ${msg.role}, type: ${typeof msg.content})`,
            { messageIndex: i, role: msg.role, contentType: typeof msg.content },
          );
          return sendJson(res, 400, {
            error: {
              message: `Invalid request: message[${i}].content must be string or array, got ${typeof msg.content}`,
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

      // ── OpenClaw directive interception ──────────────────────────────────
      // Messages from OpenClaw that are internal directives (e.g. pre-compaction
      // memory flush) must NOT be forwarded to AI models. The content pattern
      // match is the primary gate; absence of a Discord message ID is secondary.
      const OPENCLAW_DIRECTIVE_RE =
        /Pre-compaction memory flush|Store durable memories only in memory\//i;
      const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
      const lastUserTextRaw =
        typeof lastUserMsg?.content === "string"
          ? lastUserMsg.content
          : Array.isArray(lastUserMsg?.content)
            ? lastUserMsg.content
                .filter((p) => p.type === "text")
                .map((p) => p.text)
                .join(" ")
            : "";

      if (OPENCLAW_DIRECTIVE_RE.test(lastUserTextRaw)) {
        logInfo(
          `🔇 Intercepted OpenClaw directive (not forwarding to AI): ${lastUserTextRaw.slice(0, 120)}`,
        );
        const ackText = "[Symphony] Memory directive acknowledged — handled internally.";
        const directiveResult = {
          completed: true,
          failureClass: null,
          stepCount: 0,
          toolCallCount: 0,
          needsContinuation: false,
        };
        if (body.stream === true) {
          res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          });
          const chunk = {
            id: `chatcmpl-directive-${Date.now()}`,
            object: "chat.completion.chunk",
            created: Math.floor(Date.now() / 1000),
            model: body.model || MODEL_ID,
            choices: [{ index: 0, delta: { content: ackText }, finish_reason: "stop" }],
            _symphonyResult: directiveResult,
          };
          res.write(`data: ${JSON.stringify(chunk)}\n\n`);
          res.write("data: [DONE]\n\n");
          res.end();
        } else {
          sendJson(res, 200, {
            id: `chatcmpl-directive-${Date.now()}`,
            object: "chat.completion",
            created: Math.floor(Date.now() / 1000),
            model: body.model || MODEL_ID,
            choices: [
              {
                index: 0,
                message: { role: "assistant", content: ackText },
                finish_reason: "stop",
              },
            ],
            _symphony_provider: "symphony-internal",
            _symphonyResult: directiveResult,
          });
        }
        return;
      }

      const route = resolveRoute(body.model || MODEL_ID);
      route.useTools = shouldUseToolsForRequest(messages, route);
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
        `Chat completion: requestedModel=${route.requestedModelId}, routedModel=${route.responseModelId}, messages=${messages.length}, stream=${stream}, useTools=${route.useTools}`,
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
      setRequestIdCounter(requestIdCounter + 1);
      const requestId = `req-${requestIdCounter}`;

      // Set current request ID for file change tracking
      setCurrentRequestId(requestId);

      // Track this request
      if (activeRequests.size >= MAX_CONCURRENT_REQUESTS) {
        return sendJson(res, 429, {
          error: { message: "Too many concurrent requests. Please try again later." },
        });
      }
      const safeRequestLabel =
        issueContext?.identifier ||
        (contentStr ? `request (${contentStr.length} chars)` : "(system task)");

      activeRequests.set(requestId, {
        startTime,
        issueId: issueContext?.identifier || null,
        requestText: safeRequestLabel,
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

      // Read in-progress issues from symphony state
      let inProgressIssues = [];
      try {
        const { loadState, leaseIsActive } = await import("../../../core/symphony-state.mjs");
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
          if (r.issueId) return `${r.issueId}: in progress`;
          return r.requestText || "request in progress";
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

      // Detect voice requests early to gate Discord notifications (prevents TTS→STT feedback loop)
      const isVoiceRequest = VOICE_TRANSCRIPT_RE.test(contentStr);

      // Build sanitized message preview for Discord notifications
      const messagePreview = sanitizeForDiscordPreview(contentStr) || "(system task)";

      // Skip Discord text notifications and voice announcements for voice requests —
      // OpenClaw auto-TTS speaks the response, so extra notifications cause feedback.
      if (!isVoiceRequest && !isSymphonyRunner) {
        // Build title with worktree ID
        const worktreeLabel = worktreeId ? ` | ${worktreeId}` : "";
        const embedTitle = issueContext?.identifier
          ? `⏳ ${issueContext.identifier}${worktreeLabel}`
          : `⏳ Processing Request${worktreeLabel}`;
        const embedDescription = issueContext?.title
          ? issueContext.title
          : messagePreview || "(no description)";

        sendDiscordEmbed(
          {
            title: embedTitle,
            description: embedDescription,
            color: 0xffa500, // Orange
            fields: fields.length > 0 ? fields : undefined,
            threadName: issueContext?.identifier || "Bridge",
          },
          discordOptions,
        ).catch((err) => safeLogDebug(`Discord webhook failed: ${err.message}`));

        voiceAnnounce(`Starting work on ${issueContext?.title || messagePreview}.`);
      }

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
                    content: isVoiceRequest
                      ? "\nSorry, the request timed out. Please try again."
                      : `\n[Error: Request timed out after ${formatElapsed(elapsed)}]`,
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

      // ── Voice request detection ──────────────────────────────────────────────
      // When the request originates from a Discord voice channel (OpenClaw sends
      // "Voice transcript from speaker ..."), inject a system prompt that tells
      // the LLM to respond in speech-friendly format. This applies to all three
      // provider paths (Codebuff direct, standard stream cascade, non-streaming).
      if (isVoiceRequest) {
        logInfo(`🎙️ Voice request detected — injecting speech-friendly system prompt`);
        const firstNonSystem = messages.findIndex((m) => m.role !== "system");
        messages.splice(firstNonSystem < 0 ? messages.length : firstNonSystem, 0, {
          role: "system",
          content: VOICE_SYSTEM_PROMPT,
        });
      }

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

        const isSelectedCodebuff =
          selectedProvider?.driver === "codebuff-sdk" ||
          selectedProvider?.name === "codebuff" ||
          selectedProvider?.name?.startsWith("codebuff-");

        if (isSelectedCodebuff) {
          try {
            logInfo(
              `🌊 Using transparent SSE relay for Codebuff (real-time streaming, bypasses AI SDK)`,
            );

            // Stream output to Discord as it's received (immediate, no buffering)
            // Skip for Discord-originated requests — the Discord command handler
            // already streams text from the SSE response to avoid double delivery.
            const isDiscordOrigin = sessionId?.startsWith("discord:");
            const streamToDiscord =
              isDiscordOrigin || isVoiceRequest || isSymphonyRunner
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

            const result = await invokeCodebuffDirectStreamToSSE(
              messages,
              res,
              streamToDiscord,
              requestCwd,
              selectedProvider,
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
              `✅ Finished: ${issueContext?.identifier || "Request"} (provider: ${result.providerName}, ${result.text.length} chars)`,
            );

            // Send compact completion notification (non-blocking)
            const completionFields = [
              { name: "Output", value: `${result.text.length} chars`, inline: true },
              { name: "Model", value: result.providerName, inline: true },
            ];
            if (issueContext?.identifier) {
              completionFields.unshift({
                name: "Issue",
                value: issueContext.identifier,
                inline: true,
              });
            }
            const completionWorktreeLabel = worktreeId ? ` | ${worktreeId}` : "";
            const completionTitle = issueContext?.identifier
              ? `✅ ${issueContext.identifier}${completionWorktreeLabel}`
              : `✅ Done${completionWorktreeLabel}`;
            if (!isVoiceRequest && !isSymphonyRunner) {
              sendDiscordEmbed(
                {
                  title: completionTitle,
                  description: issueContext?.title || messagePreview,
                  color: 0x00ff00, // Green
                  fields: completionFields,
                  threadName: issueContext?.identifier || "Bridge",
                },
                discordOptions,
              ).catch((err) => safeLogDebug(`Discord webhook failed: ${err.message}`));

              voiceAnnounce(`Finished ${issueContext?.title || messagePreview}.`);
            }

            {
              const _fin = await finalizeWorktreeRequest();
              logInfo(`🧾 Request complete without bridge promotion`, _fin);
            }

            const durationMs = Date.now() - startTime;
            recordBridgeMetrics({
              provider: result.providerName,
              durationMs,
              isStream: true,
              isError: false,
            });
            recordProviderSuccess(result.providerName);
            recordSuccessfulMetrics(result.providerName, startTime);

            // Update session state for codebuff
            if (sessionId) {
              // Detect mode from response or errors
              const mode = result.mode || "unknown";
              updateSessionProvider(sessionId, {
                name: result.providerName,
                mode,
                tier: selectedProvider?.tier || "paid",
              });
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
              recordProviderFailure(selectedProvider.name);
              recordProviderFailureCount(selectedProvider.name);
            }
            logInfo(
              `🔄 Falling back to standard provider cascade (excluding ${selectedProvider.name})...`,
            );
            // Fall through to standard fallback cascade, excluding the failed codebuff
          }
        }

        // If codebuff was tried and failed, exclude it from the cascade
        const excludeAfterCodebuff =
          isSelectedCodebuff && selectedProvider?.name ? [selectedProvider.name] : [];

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
            isSelectedCodebuff ? null : selectedProvider,
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

          // Send compact completion notification (non-blocking)
          const streamCompletionFields = [
            { name: "Output", value: `${result.text.length} chars`, inline: true },
            { name: "Model", value: result.providerName, inline: true },
          ];
          if (issueContext?.identifier) {
            streamCompletionFields.unshift({
              name: "Issue",
              value: issueContext.identifier,
              inline: true,
            });
          }
          const streamCompletionWorktreeLabel = worktreeId ? ` | ${worktreeId}` : "";
          const streamCompletionTitle = issueContext?.identifier
            ? `✅ ${issueContext.identifier}${streamCompletionWorktreeLabel}`
            : `✅ Done${streamCompletionWorktreeLabel}`;
          if (!isVoiceRequest && !isSymphonyRunner) {
            sendDiscordEmbed(
              {
                title: streamCompletionTitle,
                description: issueContext?.title || messagePreview,
                color: 0x00ff00, // Green
                fields: streamCompletionFields,
                threadName: issueContext?.identifier || "Bridge",
              },
              discordOptions,
            ).catch((err) => safeLogDebug(`Discord webhook failed: ${err.message}`));

            voiceAnnounce(`Finished ${issueContext?.title || messagePreview}.`);
          }

          {
            const _fin = await finalizeWorktreeRequest();
            logInfo(`🧾 Request complete without bridge promotion`, _fin);
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
                delta: {
                  content: isVoiceRequest
                    ? "\nSorry, I'm having trouble right now. Please try again in a moment."
                    : `\n[Error: ${streamError.message}]`,
                },
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
          {
            name: "Output",
            value: totalTokens > 0 ? `${totalTokens} tokens` : `${resultText.length} chars`,
            inline: true,
          },
          { name: "Model", value: result.providerName, inline: true },
        ];
        if (issueContext?.identifier) {
          nonStreamCompletionFields.unshift({
            name: "Issue",
            value: issueContext.identifier,
            inline: true,
          });
        }
        const nonStreamCompletionWorktreeLabel = worktreeId ? ` | ${worktreeId}` : "";
        const nonStreamCompletionTitle = issueContext?.identifier
          ? `✅ ${issueContext.identifier}${nonStreamCompletionWorktreeLabel}`
          : `✅ Done${nonStreamCompletionWorktreeLabel}`;
        if (!isVoiceRequest && !isSymphonyRunner) {
          sendDiscordEmbed(
            {
              title: nonStreamCompletionTitle,
              description: issueContext?.title || messagePreview,
              color: 0x00ff00, // Green
              fields: nonStreamCompletionFields,
              threadName: issueContext?.identifier || "Bridge",
            },
            discordOptions,
          ).catch((err) => safeLogDebug(`Discord webhook failed: ${err.message}`));

          voiceAnnounce(`Finished ${issueContext?.title || messagePreview}.`);
        }

        {
          const _fin = await finalizeWorktreeRequest();
          logInfo(`🧾 Request complete without bridge promotion`, _fin);
        }

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
