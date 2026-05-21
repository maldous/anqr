import fs from "node:fs";
import http from "node:http";
import path from "node:path";
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
import {
  streamDiscordUpdate,
  sendDiscordEmbed,
  finalizeDiscordStream,
} from "../../notifications/openclaw-discord.mjs";
import {
  updateSessionProvider,
  setSessionMessages,
  resolveSessionKey,
  setSessionSource,
  clearSessionProvider,
  getSessionContextBudgetCap,
} from "../symphony-session-state.mjs";

import { ADVERTISED_MODELS } from "./advertised-models.mjs";
import { BRIDGE_METRICS } from "./bridge-metrics.mjs";
import { PROBE_CACHE_FILE } from "./probe-cache-file.mjs";
import { DISCOVERED_PER_REQUEST_LIMITS_FILE } from "../symphony-bridge-truncation.mjs";
import { MAX_CONCURRENT_REQUESTS } from "./max-concurrent-requests.mjs";
import { MODEL_ID } from "./model-id.mjs";
import { REQUEST_TIMEOUT_MS } from "./request-timeout-ms.mjs";
import { VOICE_SYSTEM_PROMPT } from "./voice-system-prompt.mjs";
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
import { BRIDGE_ROOT } from "./bridge-root.mjs";
import { parseBody } from "./parse-body.mjs";
import { providerStatusCache } from "./provider-status-cache.mjs";
import { recordBridgeMetrics } from "./record-bridge-metrics.mjs";
import { recordSuccessfulMetrics } from "./record-successful-metrics.mjs";
import { refreshProviderStatus } from "./refresh-provider-status.mjs";
import { requestIdCounter, setRequestIdCounter } from "./request-id-counter.mjs";
import { resolveRoute } from "./resolve-route.mjs";
import { safeLogDebug } from "./safe-log-debug.mjs";
import {
  recordProviderSelection,
  recordProviderRoutingEvidence,
  recordContextReductionEvidence,
  recordSafetyNetEvidence,
} from "../../../core/task-evidence.mjs";
import { sanitizeForDiscordPreview } from "./sanitize-for-discord-preview.mjs";
import { sendJson } from "./send-json.mjs";
import { shouldUseToolsForRequest } from "./should-use-tools-for-request.mjs";
import { requestContextStorage } from "./request-context-storage.mjs";
import { setCurrentRequestId } from "./set-current-request-id.mjs";
import { unauthorized } from "./unauthorized.mjs";
import { verifyWorktreeFreshnessNonBlocking } from "./verify-worktree-freshness-non-blocking.mjs";
import { voiceAnnounce } from "./voice-announce.mjs";
import { handleResponsesApi } from "./handle-responses-api.mjs";
import { logDebug, logInfo, logWarn, logError } from "./logger.mjs";
import { validateBoundaryInvariants } from "./validate-boundary-invariants.mjs";
import { validateStartupEnv } from "./validate-startup-env.mjs";
import {
  persistInflightRequest,
  completeInflightRequest,
  scanStaleInflightRequests,
} from "../../../core/symphony-shared-state/request-rehydration.mjs";

function getMessageText(msg) {
  if (typeof msg?.content === "string") return msg.content;
  if (Array.isArray(msg?.content)) {
    return msg.content
      .filter((p) => p.type === "text")
      .map((p) => p.text)
      .join(" ");
  }
  return "";
}

// D Phase 3: Validate boundary invariants at bridge startup (ADR-0008).
// Both validators throw on critical misconfigurations (fail-closed).
// Advisory warnings are logged here for operator visibility.
const boundaryResult = validateBoundaryInvariants();
if (!boundaryResult.valid) {
  logWarn(
    `[startup] Boundary invariant warnings (${boundaryResult.warnings.length}): ` +
      boundaryResult.warnings.join("; "),
  );
}

// E Phase 2: Validate critical startup environment.
const envResult = validateStartupEnv();
if (!envResult.valid) {
  logWarn(
    `[startup] Startup env warnings (${envResult.warnings.length}): ` +
      envResult.warnings.join("; "),
  );
}

// Phase 7: Scan for stale in-flight requests from a previous crash.
// These are requests that were persisted but never completed — likely the
// process died mid-request. Log them for diagnostics and clean them up.
const staleRequests = scanStaleInflightRequests();
if (staleRequests.length > 0) {
  logWarn(
    `[startup] Cleaned ${staleRequests.length} stale in-flight request(s) from previous run: ` +
      staleRequests
        .map(
          (r) =>
            `${r.requestId} (session=${r.sessionKey || "?"}, age=${Math.round((Date.now() - r.startedAt) / 1000)}s)`,
        )
        .join(", "),
  );
}

export const server = http.createServer(async (req, res) => {
  logDebug(`===== REQUEST =====`);
  logDebug(`method: ${req.method}, url: ${req.url}`);

  try {
    const skipAuth =
      req.url === "/health" ||
      req.url === "/v1/models" ||
      req.url === "/v1/providers" ||
      req.url === "/v1/responses";
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

    // GET /health — lightweight (must NOT call getProviderStats or getRankedProviders)
    if (req.method === "GET" && req.url === "/health") {
      const configuredCount = providerStatusCache.configured.length;
      const availableCount = providerStatusCache.probeResults.filter((r) => r.available).length;

      return sendJson(res, 200, {
        status: "ok",
        model: MODEL_ID,
        providersConfigured: configuredCount,
        providersAvailable: availableCount,
        providersWithStats: configuredCount,
        lastProbeAt: providerStatusCache.lastProbeAt,
        probing: providerStatusCache.probing || false,
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
      try {
        if (fs.existsSync(DISCOVERED_PER_REQUEST_LIMITS_FILE)) {
          fs.unlinkSync(DISCOVERED_PER_REQUEST_LIMITS_FILE);
          logInfo(`🔄 Discovered per-request limits cache deleted`);
        }
      } catch (err) {
        logWarn(`Failed to delete discovered limits cache: ${err.message}`);
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

    // POST /v1/responses — OpenAI Responses API (used by Codex CLI)
    if (req.method === "POST" && req.url === "/v1/responses") {
      return handleResponsesApi(req, res);
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
      const sessionId =
        req.headers["x-openclaw-session"] || req.headers["x-openclaw-session-key"] || null;
      const worktreeId = req.headers["x-worktree-id"] || null;
      const correlationId = req.headers["x-anqr-correlation-id"] || null;
      const anqrIssueId = req.headers["x-anqr-issue-id"] || null;
      const anqrRunId = req.headers["x-anqr-run-id"] || null;
      const isSymphonyRunner = req.headers["x-symphony-origin"] === "runner";
      const requestCwd = normalizeRequestCwd(body.cwd);

      // ── Bridge cwd invariant (ADR-0008 enforcement) ───────────────────────
      // Runner requests MUST carry body.cwd so that bridge tool mutations
      // land in the correct worktree, not in the bridge's default root.
      // If cwd is absent or the normalized path escapes the worktree,
      // fail closed (400) to prevent silent cross-worktree leakage.
      if (isSymphonyRunner) {
        if (!body.cwd || typeof body.cwd !== "string" || !body.cwd.trim()) {
          logError(
            `[boundary] REJECT: Runner request missing body.cwd — ` +
            `tool mutations would default to BRIDGE_ROOT (${BRIDGE_ROOT})`,
          );
          return sendJson(res, 400, {
            error: {
              message: "Runner requests must include body.cwd to ensure worktree-scoped tool mutations",
              type: "invalid_request_error",
              param: "cwd",
            },
          });
        }
        // Verify that the normalized cwd stays within the worktree boundary.
        // If remapRepoPathToBridgeRoot redirects the path outside the expected
        // worktree root, fail closed to prevent cross-worktree leakage.
        const relativeFromBridgeRoot = path.relative(BRIDGE_ROOT, requestCwd);
        // path.relative() returns a relative path or empty string; the only way
        // to escape the parent is if the result starts with "..".
        const escapesWorktree = relativeFromBridgeRoot.startsWith("..");
        if (escapesWorktree) {
          logError(
            `[boundary] REJECT: Runner cwd escapes worktree boundary — ` +
            `requested=${body.cwd} normalized=${requestCwd} bridgeRoot=${BRIDGE_ROOT} ` +
            `relative=${relativeFromBridgeRoot}`,
          );
          return sendJson(res, 400, {
            error: {
              message: `Runner cwd (${requestCwd}) escapes worktree boundary (${BRIDGE_ROOT}) — tool mutations would land outside the assigned worktree`,
              type: "invalid_request_error",
              param: "cwd",
            },
          });
        }
        // Log both the raw and normalized cwd for observability.
        logInfo(
          `[boundary] Runner cwd: requested=${body.cwd} normalized=${requestCwd} bridgeRoot=${BRIDGE_ROOT}`,
        );
      }

      // Extract Discord message ID, thread name, and Linear thread name for thread/reply functionality
      const discordMessageId = req.headers["x-discord-message-id"] || null;
      const discordThreadNameRaw = req.headers["x-discord-thread-name"] || null;
      const discordThreadName = discordThreadNameRaw
        ? decodeURIComponent(discordThreadNameRaw)
        : null;
      const linearThreadName = req.headers["x-linear-thread-name"] || null;
      // Extract Discord source type from available identifiers
      let discordSource = null;
      if (discordMessageId || discordThreadName) {
        discordSource = "discord";
      } else if (linearThreadName) {
        discordSource = "linear";
      }
      const isDiscordOriginRequest = discordSource === "discord";
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
      const lastUserTextRaw = getMessageText(lastUserMsg);

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
      const isCodexRequest = worktreeId === "codex";

      // Detect voice requests early — scan last 6 messages, match anywhere in content
      // (not just ^) because openclaw may prepend bootstrap context to the same message.
      const isVoiceRequestEarly = messages
        .slice(-6)
        .some((m) => {
          const c = getMessageText(m);
          const match = /Voice transcript from speaker/i.test(c);
          if (match) logInfo(`🎙️ Voice detection: matched in role=${m.role} content="${c.slice(0, 80)}"`);
          return match;
        });
      logInfo(`🎙️ isVoiceRequestEarly=${isVoiceRequestEarly} (scanned ${Math.min(6, messages.length)} messages)`);

      // Voice requests are conversational but may include action requests (create issue, etc.).
      // Keep tools enabled so the agent can act when asked — the context budget cap handles token pressure.
      // Previously stripped tools entirely, but that prevented "create an issue" voice commands from working.
      route.useTools = isCodexRequest || shouldUseToolsForRequest(messages, route);
      const voiceContextBudgetCap = isVoiceRequestEarly
        ? Number(process.env.SYMPHONY_VOICE_CONTEXT_CAP) || 8000
        : null;
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

      // Resolve canonical session key from source identity (Discord guild/channel, Linear issue).
      // Placed after issueContext extraction so Linear keys can use the issue identifier.
      // Falls back to the header-provided session key if no source identity headers are present.
      const canonicalSessionKey = resolveSessionKey({
        discordGuildId: req.headers["x-discord-guild-id"] || null,
        discordChannelId: req.headers["x-discord-channel-id"] || null,
        linearIssueIdentifier: issueContext?.identifier || null,
        headerSessionKey: sessionId,
      });
      // Effective session key: canonical key if resolved, otherwise header-provided sessionId.
      // When falling back to raw sessionId (no canonical resolution), the key won't have a
      // prefix like "discord:" or "linear:", but this is intentional — it preserves backward
      // compatibility with existing session records that used raw header values as keys.
      const effectiveSessionKey = canonicalSessionKey || sessionId;

      if (canonicalSessionKey && canonicalSessionKey !== sessionId) {
        logDebug(`Session key remapped: ${sessionId} → ${canonicalSessionKey}`);
      }

      // Clear voice session sticky after session key is resolved so voice
      // requests get fresh provider selection (prevents getting trapped on a
      // single provider with a small context window).
      if (isVoiceRequestEarly && effectiveSessionKey) {
        clearSessionProvider(effectiveSessionKey);
        logInfo(`🎙️ Voice request — cleared session sticky for fresh provider selection`);
      }

      // Load persisted context budget cap from session state so learned
      // limits survive bridge restarts (ANQ-4342).
      const persistedContextBudgetCap = getSessionContextBudgetCap(effectiveSessionKey);
      let initialContextBudgetCap;
      if (voiceContextBudgetCap != null && persistedContextBudgetCap != null) {
        initialContextBudgetCap = Math.min(voiceContextBudgetCap, persistedContextBudgetCap);
      } else {
        initialContextBudgetCap = voiceContextBudgetCap ?? persistedContextBudgetCap;
      }

      if (initialContextBudgetCap) {
        logInfo(
          `📏 Initial context budget cap: ${initialContextBudgetCap} tokens (voice=${voiceContextBudgetCap}, persisted=${persistedContextBudgetCap})`,
        );
      }

      // Stamp source identity on the session record for durable ownership tracking.
      if (effectiveSessionKey) {
        let sourceType = "header";
        if (canonicalSessionKey?.startsWith("discord:")) {
          sourceType = "discord";
        } else if (canonicalSessionKey?.startsWith("linear:")) {
          sourceType = "linear";
        }
        setSessionSource(effectiveSessionKey, {
          type: sourceType,
          discordGuildId: req.headers["x-discord-guild-id"] || undefined,
          discordChannelId: req.headers["x-discord-channel-id"] || undefined,
          linearIssueIdentifier: issueContext?.identifier || undefined,
        });
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
      req._startTime = startTime; // Defensive: attach to req for catch blocks
      setRequestIdCounter(requestIdCounter + 1);
      const requestId = `req-${requestIdCounter}`;

      // Structured request lifecycle log — request start
      logDebug(
        `[${requestId}] REQUEST START | model=${route.responseModelId} stream=${stream} useTools=${route.useTools} sessionKey=${effectiveSessionKey || "none"} worktreeId=${worktreeId || "none"} issue=${anqrIssueId || "none"} run=${anqrRunId || "none"} messages=${messages.length}`,
      );

      // Set concurrency-safe async-local context (used by getCurrentRequestId() / getRequestContext()).
      // Also set the deprecated module-global for backward compat with code not yet migrated
      // to use the async-local getters — under concurrency, only the async-local value is reliable.
      setCurrentRequestId(requestId);

      // Track this request
      if (activeRequests.size >= MAX_CONCURRENT_REQUESTS) {
        return sendJson(res, 429, {
          error: { message: "Too many concurrent requests. Please try again later." },
        });
      }

      // Enter concurrency-safe async-local context for this request.
      // enterWith() propagates to all async descendants of this call,
      // so getCurrentRequestId() / getRequestContext() return the correct
      // values for THIS request even under concurrent execution.
      //
      // NOTE: enterWith() does NOT auto-restore (unlike run()). This is safe
      // here because each HTTP handler invocation is a top-level async flow
      // that runs to completion before the next request on this call stack.
      // If this handler is ever refactored into a separate function, prefer
      // requestContextStorage.run() for bounded scoping instead.
      requestContextStorage.enterWith({ requestId, sessionKey: effectiveSessionKey, worktreeId });

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

      // Phase 7: Persist in-flight request for crash recovery / rehydration.
      // providerName is unknown until credit-gate selects — updated below after selection.
      persistInflightRequest(requestId, {
        sessionKey: effectiveSessionKey,
        worktreeId: worktreeId || null,
        model: route.responseModelId,
        startedAt: startTime,
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

      // Reuse early detection (scans last 4 messages, not just last one)
      const isVoiceRequest = isVoiceRequestEarly;

      // Build sanitized message preview for Discord notifications
      const messagePreview = sanitizeForDiscordPreview(contentStr) || "(system task)";

      // Announce only for: coding tasks from the symphony runner, OR explicit discord-origin
      // requests. Internal openclaw requests (context summarization, etc.) have neither
      // header and must not trigger voice announces.
      const shouldAnnounce = !isVoiceRequest && (isDiscordOriginRequest || (isSymphonyRunner && !isDiscordOriginRequest));
      if (shouldAnnounce) {
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
            threadName: issueContext?.identifier || "ANQR",
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
        completeInflightRequest(requestId);
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
        finalizeDiscordStream({ requestId }).catch(() => {});
      }, REQUEST_TIMEOUT_MS);

      // ── Voice request detection ──────────────────────────────────────────────
      // When the request originates from a Discord voice channel (OpenClaw sends
      // "Voice transcript from speaker ..."), inject a system prompt that tells
      // the LLM to respond in speech-friendly format. This applies to all three
      // provider paths (Codebuff direct, standard stream cascade, non-streaming).
      if (isVoiceRequest) {
        logInfo(`🎙️ Voice request detected — replacing system prompt with voice-only prompt`);
        // Keep only the first system message (agent identity from SOUL.md), replace the
        // rest (coding executor instructions) with the concise voice prompt. This reclaims
        // ~8K tokens of coding-executor context for conversation history.
        const firstSystem = messages.find((m) => m.role === "system");
        const nonSystemMessages = messages.filter((m) => m.role !== "system");
        const identityLine = firstSystem?.content
          ? getMessageText(firstSystem).split("\n").slice(0, 3).join(" ").slice(0, 200)
          : "";
        const combinedSystemContent = [
          identityLine || "You are ANQR, a coding assistant running in Discord.",
          VOICE_SYSTEM_PROMPT,
        ]
          .filter(Boolean)
          .join(" ");
        messages.length = 0;
        messages.push({ role: "system", content: combinedSystemContent }, ...nonSystemMessages);
        logInfo(`🎙️ Voice system prompt: ${combinedSystemContent.slice(0, 120)}...`);
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
        // F5: Capture ranked selection rationale for evidence
        const selectionLog = [];
        const selectedProvider = await selectProvider({
          ...buildSelectionOptions(route, [], effectiveSessionKey),
          selectionLog,
        });

        // Phase 7: Update in-flight record with selected provider name.
        if (selectedProvider?.name) {
          persistInflightRequest(requestId, {
            sessionKey: effectiveSessionKey,
            worktreeId: worktreeId || null,
            providerName: selectedProvider.name,
            model: route.responseModelId,
            startedAt: startTime,
          });
        }

        logInfo(
          `🔍 Credit-gate selected: ${selectedProvider?.name || "none"} (route=${route.normalizedModelId})`,
        );
        // Structured provider selection debug log with rationale
        logDebug(
          `[${requestId}] PROVIDER SELECTED | name=${selectedProvider?.name || "none"} model=${selectedProvider?.model || "N/A"} tier=${selectedProvider?.tier || "N/A"} driver=${selectedProvider?.driver || "N/A"} score=${selectedProvider?.score ?? "N/A"} route=${route.normalizedModelId} rationale=${selectionLog.length > 0 ? selectionLog.join("; ") : "default"}`,
        );

        if (correlationId && selectedProvider) {
          try {
            recordProviderSelection(correlationId, {
              providerName: selectedProvider.name,
              model: selectedProvider.model,
            });
          } catch {
            /* best-effort evidence */
          }
        }

        const isSelectedCodebuff =
          selectedProvider?.driver === "codebuff-sdk" ||
          selectedProvider?.name === "codebuff" ||
          selectedProvider?.name?.startsWith("codebuff-");

        // Stream output to Discord as it's received (immediate, no buffering)
        // Voice requests and symphony runner requests skip Discord streaming
        // to avoid feedback loops. Discord-originated requests DO stream —
        // OpenClaw only shows typing + final message, so ANQR must handle
        // real-time streaming to give users progressive visibility.
        const streamToDiscord =
          isVoiceRequest || (isSymphonyRunner && !isDiscordOriginRequest)
            ? null
            : (text) => {
                if (text && text.length > 0) {
                  const isActivityMarker = /^🔧\s+\w+:?\s*$|^✅\s+\w+\s+done\s*$/;
                  const trimmed = text.trim();
                  const isLightbulb = trimmed === "💡" || text === "\n💡 " || text === "💡 ";
                  if (!isActivityMarker.test(trimmed) && !isLightbulb) {
                    streamDiscordUpdate(text, {
                      emoji: "",
                      requestId,
                      threadName: discordOptions.threadName || issueContext?.identifier || "ANQR",
                      replyTo: discordOptions.replyTo,
                      source: discordOptions.source,
                    }).catch((err) => logWarn(`Discord stream update failed: ${err.message}`));
                  }
                }
              };

        if (isSelectedCodebuff) {
          try {
            logInfo(
              `🌊 Using transparent SSE relay for Codebuff (real-time streaming, bypasses AI SDK)`,
            );

            // For voice requests, proactively truncate messages before sending to
            // CodeBuff SDK to avoid first-attempt CONTEXT_TOO_LARGE errors.
            // CodeBuff direct path doesn't go through the fallback cascade, so the
            // voiceContextBudgetCap must be applied here.
            let codebuffMessages = messages;
            if (isVoiceRequest && voiceContextBudgetCap) {
              const markerRe = /^\[\d+ earlier messages removed/;
              const sysMsgs = messages.filter(
                (m) => m.role === "system" && !markerRe.test(m.content),
              );
              const nonSysMsgs = messages.filter((m) => m.role !== "system");
              const keepCount = 4; // keep last 4 non-system messages for voice
              if (nonSysMsgs.length > keepCount) {
                const dropped = nonSysMsgs.length - keepCount;
                codebuffMessages = [
                  ...sysMsgs,
                  {
                    role: "system",
                    content: `[${dropped} earlier messages removed for voice context limits]`,
                  },
                  ...nonSysMsgs.slice(-keepCount),
                ];
                logInfo(
                  `🎙️ Voice+CodeBuff: truncated ${dropped} messages (${messages.length} → ${codebuffMessages.length})`,
                );
              }
            }

            const result = await invokeCodebuffDirectStreamToSSE(
              codebuffMessages,
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
            completeInflightRequest(requestId);

            logInfo(
              `✅ Finished: ${issueContext?.identifier || "Request"} (provider: ${result.providerName}, ${result.text.length} chars)`,
            );
            // Structured request lifecycle log — Codebuff direct stream completion
            logDebug(
              `[${requestId}] REQUEST COMPLETE | provider=${result.providerName} duration=${Date.now() - startTime}ms chars=${result.text.length} path=codebuff-direct`,
            );

            await finalizeDiscordStream({ requestId });

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
            if (shouldAnnounce) {
              sendDiscordEmbed(
                {
                  title: completionTitle,
                  description: issueContext?.title || messagePreview,
                  color: 0x00ff00, // Green
                  fields: completionFields,
                  threadName: issueContext?.identifier || "ANQR",
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

            // F Phase 3: Emit routing evidence for Codebuff transparent relay (F6)
            if (correlationId) {
              try {
                recordProviderRoutingEvidence(correlationId, {
                  routeModelId: route.responseModelId,
                  allowedProviders: route.allowedNames || [],
                  selectedProvider: result.providerName,
                  attempts: 1,
                  triedProviders: [result.providerName],
                  fallbackChain: [
                    {
                      providerName: result.providerName,
                      model: selectedProvider?.model || "codebuff/base",
                      attemptNumber: 1,
                      outcome: "success",
                      durationMs: Date.now() - startTime,
                    },
                  ],
                  selectionRationale: selectionLog.length > 0 ? selectionLog : null,
                });
              } catch {
                /* best-effort evidence */
              }
            }

            // Update session state for codebuff (use canonical session key)
            if (effectiveSessionKey) {
              // Detect mode from response or errors
              const mode = result.mode || "unknown";
              updateSessionProvider(effectiveSessionKey, {
                name: result.providerName,
                mode,
                tier: selectedProvider?.tier || "paid",
              });
              // Store server-side message history for context verification on provider switches
              setSessionMessages(effectiveSessionKey, messages);
            }
            maybeGC();
            return;
          } catch (error_) {
            const errMsg = String(error_.message || error_).slice(0, 200);
            logWarn(`⚠️ Codebuff transparent relay failed: ${errMsg}`);

            await finalizeDiscordStream({ requestId });

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
          let streamedTextLength = 0;
          const result = await invokeWithFallbackStream(
            messages,
            route,
            (chunk) => {
              if (chunk.type === "text") {
                streamedTextLength += chunk.text.length;
                const chunkData = {
                  id: completionId,
                  object: "chat.completion.chunk",
                  created,
                  model: route.responseModelId,
                  choices: [{ index: 0, delta: { content: chunk.text }, finish_reason: null }],
                };
                res.write(`data: ${JSON.stringify(chunkData)}\n\n`);
                if (streamToDiscord) streamToDiscord(chunk.text);
              }
            },
            {
              initialExcluded: excludeAfterCodebuff,
              sessionId: effectiveSessionKey,
              cwd: requestCwd,
              initialProvider: isSelectedCodebuff ? null : selectedProvider,
              initialContextBudgetCap,
            },
          );

          clearInterval(heartbeat);
          clearInterval(progressInterval);
          clearTimeout(requestTimeoutHandle);

          // F Phase 1: Emit provider routing evidence (streaming path)
          if (correlationId) {
            try {
              recordProviderRoutingEvidence(correlationId, {
                routeModelId: route.responseModelId,
                allowedProviders: route.allowedNames || [],
                selectedProvider: result.providerName,
                attempts: result.attempts,
                triedProviders: result.triedProviders,
                fallbackChain: result.fallbackChain || [],
                selectionRationale: selectionLog.length > 0 ? selectionLog : null,
              });
            } catch {
              /* best-effort evidence */
            }
            // F Phase 2: Emit context-reduction evidence (streaming path)
            try {
              if (result.contextReductions?.length > 0) {
                recordContextReductionEvidence(correlationId, result.contextReductions);
              }
            } catch {
              /* best-effort evidence */
            }
          }

          // If the provider returned text but streaming emitted no chunks (e.g. groq gpt-oss
          // returns text only in result.text with no text-delta events), emit it now so the
          // caller sees content rather than an empty stream.
          if (streamedTextLength === 0 && result.text?.length > 0) {
            logInfo(`⚠️ Stream produced no text chunks; emitting result.text as final content (${result.text.length} chars)`);
            const fallbackChunk = {
              id: completionId,
              object: "chat.completion.chunk",
              created,
              model: route.responseModelId,
              choices: [{ index: 0, delta: { content: result.text }, finish_reason: null }],
            };
            res.write(`data: ${JSON.stringify(fallbackChunk)}\n\n`);
            if (streamToDiscord) streamToDiscord(result.text);
          }

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
          completeInflightRequest(requestId);

          logInfo(
            `✅ Finished: ${issueContext?.identifier || "Request"} (provider: ${result.providerName})`,
          );
          // Structured request lifecycle log — standard fallback stream completion
          logDebug(
            `[${requestId}] REQUEST COMPLETE | provider=${result.providerName} duration=${Date.now() - startTime}ms attempts=${result.attempts} tried=${result.triedProviders.join(",")} chars=${result.text.length} path=fallback-stream`,
          );

          await finalizeDiscordStream({ requestId });

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
          if (shouldAnnounce) {
            sendDiscordEmbed(
              {
                title: streamCompletionTitle,
                description: issueContext?.title || messagePreview,
                color: 0x00ff00, // Green
                fields: streamCompletionFields,
                threadName: issueContext?.identifier || "ANQR",
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
          await finalizeDiscordStream({ requestId });

          // Clean up request tracking
          activeRequests.delete(requestId);
          completeInflightRequest(requestId);

          clearInterval(heartbeat);
          clearInterval(progressInterval);
          clearTimeout(requestTimeoutHandle);
          // Defensive: use startTime from closure, fall back to req._startTime
          const _elapsed = Date.now() - (startTime ?? req._startTime ?? Date.now());
          // 🔍 Production diagnostics: Log full stack trace for streaming errors
          logError(`Streaming error after ${formatElapsed(_elapsed)}: ${streamError.message}`);
          if (streamError.stack) {
            logError(`[DIAG] Streaming error STACK: ${streamError.stack}`);
          }
          if (process.env.SYMPHONY_DEBUG)
            console.error(`[DIAG] Streaming error detail:`, streamError);

          // F Phase 3: Emit failure-path evidence when providers exhausted (streaming)
          // Covers F2 (routing on failure), F3 (safety-net), F4 (context-reduction on failure)
          if (correlationId && streamError.safetyNetData) {
            try {
              recordProviderRoutingEvidence(correlationId, {
                routeModelId: route.responseModelId,
                allowedProviders: route.allowedNames || [],
                selectedProvider: null,
                attempts: streamError.safetyNetData.triedProviders?.length || 0,
                triedProviders: streamError.safetyNetData.triedProviders || [],
                fallbackChain: streamError.safetyNetData.fallbackChain || [],
                selectionRationale: selectionLog.length > 0 ? selectionLog : null,
              });
            } catch {
              /* best-effort evidence */
            }
            try {
              recordSafetyNetEvidence(correlationId, streamError.safetyNetData);
            } catch {
              /* best-effort evidence */
            }
            try {
              if (streamError.safetyNetData.contextReductions?.length > 0) {
                recordContextReductionEvidence(
                  correlationId,
                  streamError.safetyNetData.contextReductions,
                );
              }
            } catch {
              /* best-effort evidence */
            }
          }

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
          result = await invokeWithFallback(messages, route, effectiveSessionKey, requestCwd, initialContextBudgetCap);
        } catch (nonStreamError) {
          // F Phase 3: Emit failure-path evidence for non-streaming exhaustion (F2, F3, F4)
          if (correlationId && nonStreamError.safetyNetData) {
            try {
              recordProviderRoutingEvidence(correlationId, {
                routeModelId: route.responseModelId,
                allowedProviders: route.allowedNames || [],
                selectedProvider: null,
                attempts: nonStreamError.safetyNetData.triedProviders?.length || 0,
                triedProviders: nonStreamError.safetyNetData.triedProviders || [],
                fallbackChain: nonStreamError.safetyNetData.fallbackChain || [],
                selectionRationale: selectionLog.length > 0 ? selectionLog : null,
              });
            } catch {
              /* best-effort evidence */
            }
            try {
              recordSafetyNetEvidence(correlationId, nonStreamError.safetyNetData);
            } catch {
              /* best-effort evidence */
            }
            try {
              if (nonStreamError.safetyNetData.contextReductions?.length > 0) {
                recordContextReductionEvidence(
                  correlationId,
                  nonStreamError.safetyNetData.contextReductions,
                );
              }
            } catch {
              /* best-effort evidence */
            }
          }
          throw nonStreamError;
        } finally {
          clearInterval(progressInterval);
          clearTimeout(requestTimeoutHandle);
        }

        const resultText = ensureString(result.text);
        const firstLine = resultText
          ? resultText.split("\n")[0].trim().slice(0, 100)
          : "(no content)";

        // F Phase 1: Emit provider routing evidence (non-streaming path)
        if (correlationId) {
          try {
            recordProviderRoutingEvidence(correlationId, {
              routeModelId: route.responseModelId,
              allowedProviders: route.allowedNames || [],
              selectedProvider: result.providerName,
              attempts: result.attempts,
              triedProviders: result.triedProviders,
              fallbackChain: result.fallbackChain || [],
              selectionRationale: selectionLog.length > 0 ? selectionLog : null,
            });
          } catch {
            /* best-effort evidence */
          }
          // F Phase 2: Emit context-reduction evidence (non-streaming path)
          try {
            if (result.contextReductions?.length > 0) {
              recordContextReductionEvidence(correlationId, result.contextReductions);
            }
          } catch {
            /* best-effort evidence */
          }
        }

        // Clean up request tracking
        activeRequests.delete(requestId);
        completeInflightRequest(requestId);

        logInfo(`✅ Finished: ${issueContext?.identifier || "Request"} — ${firstLine}`);

        // Send comprehensive completion metrics (non-blocking)
        const tokensIn = result.usage?.promptTokens || 0;
        const tokensOut = result.usage?.completionTokens || 0;

        // Structured request lifecycle log — non-streaming completion
        logDebug(
          `[${requestId}] REQUEST COMPLETE | provider=${result.providerName} duration=${Date.now() - startTime}ms attempts=${result.attempts} tried=${result.triedProviders.join(",")} tokensIn=${tokensIn} tokensOut=${tokensOut} path=non-stream`,
        );
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
        if (shouldAnnounce) {
          sendDiscordEmbed(
            {
              title: nonStreamCompletionTitle,
              description: issueContext?.title || messagePreview,
              color: 0x00ff00, // Green
              fields: nonStreamCompletionFields,
              threadName: issueContext?.identifier || "ANQR",
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
      completeInflightRequest(requestId);
      finalizeDiscordStream({ requestId }).catch(() => {});
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
