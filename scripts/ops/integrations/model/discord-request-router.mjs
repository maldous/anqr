#!/usr/bin/env node

/**
 * discord-request-router.mjs — Load balancer for Discord requests across worktrees
 *
 * Routes Discord requests to available OpenClaw Gateway instances in worktrees wt5-wt8.
 * Tracks concurrent requests and returns overload message when capacity exceeded.
 *
 * Usage:
 *   node discord-request-router.mjs [--port 18790]
 *
 * Environment:
 *   DISCORD_ROUTER_PORT    — Port to listen on (default: 18790)
 *   DISCORD_WORKTREES      — Comma-separated worktree IDs (default: 5,6,7,8)
 *   MAX_CONCURRENT        — Max concurrent requests (default: 4)
 */

import http from "node:http";
import path from "node:path";
import { createLogger } from "../../lib/logger.mjs";
import { PROJECT_ROOT, getWorktreePath } from "../../core/worktree-config.mjs";

const { logInfo, logWarn, logError, logDebug } = createLogger();

// Configuration
const PORT = process.env.DISCORD_ROUTER_PORT || 18790;
const WORKTREE_IDS = (process.env.DISCORD_WORKTREES || "5,6,7,8")
  .split(",")
  .map((s) => parseInt(s.trim(), 10))
  .filter((n) => !isNaN(n));
const MAX_CONCURRENT = parseInt(process.env.MAX_CONCURRENT || "4", 10);

// Build worktree URLs - route to Symphony bridge running in each worktree
// Port mapping: wt5 -> 4325, wt6 -> 4326, wt7 -> 4327, wt8 -> 4328
// Each Symphony bridge runs in its worktree directory with isolated working tree
const WORKTREE_URLS = WORKTREE_IDS.map((id) => ({
  id,
  path: getWorktreePath(id),
  url: `http://127.0.0.1:432${id}`,
  activeRequests: 0,
}));

// Track global concurrent requests
let globalActiveRequests = 0;

// Round-robin index for distributing requests when loads are equal
let roundRobinIndex = 0;

function isPathWithinRoot(candidatePath, rootPath) {
  if (!candidatePath || !rootPath) return false;
  const relative = path.relative(rootPath, candidatePath);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function rebaseCwdToWorktree(cwd, worktreePath) {
  if (typeof cwd !== "string" || !cwd.trim()) return worktreePath;
  const resolved = path.resolve(cwd.trim());

  if (isPathWithinRoot(resolved, worktreePath)) {
    return resolved;
  }

  if (isPathWithinRoot(resolved, PROJECT_ROOT)) {
    const relative = path.relative(PROJECT_ROOT, resolved);
    return path.resolve(worktreePath, relative);
  }

  const projectParent = path.dirname(PROJECT_ROOT);
  if (isPathWithinRoot(resolved, projectParent)) {
    const relative = path.relative(projectParent, resolved);
    const segments = relative.split(path.sep).filter(Boolean);
    if (segments.length > 0 && /^(anqr|anqr-wt\d+)$/.test(segments[0])) {
      return path.resolve(worktreePath, ...segments.slice(1));
    }
  }

  return worktreePath;
}

/**
 * Find the worktree with the least active requests (least-loaded).
 * When multiple worktrees have equal load, rotate via round-robin
 * to distribute requests evenly across all available worktrees.
 */
function getLeastLoadedWorktree() {
  if (WORKTREE_URLS.length === 0) return null;

  const minLoad = Math.min(...WORKTREE_URLS.map((wt) => wt.activeRequests));
  const candidates = WORKTREE_URLS.filter((wt) => wt.activeRequests === minLoad);

  const selected = candidates[roundRobinIndex % candidates.length];
  roundRobinIndex = (roundRobinIndex + 1) % WORKTREE_URLS.length;
  return selected;
}

/**
 * Check if we're at capacity and should return overload
 */
function isOverloaded() {
  return globalActiveRequests >= MAX_CONCURRENT;
}

/**
 * Send overload response to Discord
 */
function sendOverloadResponse(res) {
  const overloadMessage = {
    content: "⚠️ **System Overload** — Too many concurrent requests. Please try again in a moment.",
  };

  res.writeHead(429, {
    "Content-Type": "application/json",
    "X-RateLimit-Remaining": "0",
    "Retry-After": "30",
  });
  res.end(JSON.stringify(overloadMessage));

  logWarn(`🚫 Overload: rejected request (${globalActiveRequests}/${MAX_CONCURRENT} active)`);
}

/**
 * Proxy request to selected worktree
 */
function proxyToWorktree(worktree, req, res) {
  const requestBody = [];

  // Add incoming request timeout (2 minutes)
  req.setTimeout(120000, () => {
    logWarn(`⏱️ Incoming request timeout for wt${worktree.id}`);
    req.destroy(new Error("Request timeout"));
  });

  req.on("data", (chunk) => requestBody.push(chunk));
  req.on("end", async () => {
    // Update counters BEFORE proxying
    worktree.activeRequests++;
    globalActiveRequests++;

    logInfo(
      `📨 ROUTING: Discord request -> wt${worktree.id} | cwd: ${worktree.path} | active: ${worktree.activeRequests}/${globalActiveRequests}/${MAX_CONCURRENT}`,
    );

    const rawBody = Buffer.concat(requestBody).toString();
    let proxyBody = rawBody;

    let originalCwd = "(not provided)";
    let discordMessageId = null;
    try {
      const parsedBody = JSON.parse(rawBody || "{}");
      originalCwd = parsedBody.cwd || "(not provided)";
      parsedBody.cwd = rebaseCwdToWorktree(parsedBody.cwd, worktree.path);

      // Extract Discord message ID from the request for thread/reply functionality
      // Discord message IDs can come from different sources depending on the integration
      // Common paths: message.id, discordMessageId, message_id, or metadata
      discordMessageId =
        parsedBody.discordMessageId ||
        parsedBody.message?.id ||
        parsedBody.messageId ||
        parsedBody.metadata?.discordMessageId ||
        null;

      if (discordMessageId) {
        logInfo(`📝 Discord message ID: ${discordMessageId}`);
      }

      proxyBody = JSON.stringify(parsedBody);
      logInfo(`🧭 ROUTING: Discord request -> wt${worktree.id} | cwd: "${originalCwd}" -> "${parsedBody.cwd}" | port: 432${worktree.id}`);

      // CRITICAL ISOLATION CHECK: Log warning if cwd would result in main repo access
      // Only check for exact main repo path, NOT worktree paths (which also start with /home/user/src/anqr)
      if (parsedBody.cwd === PROJECT_ROOT) {
        logError(`🚨 ISOLATION VIOLATION: Request would write to main repo! cwd=${parsedBody.cwd}`);
      }
    } catch (err) {
      logWarn(`Failed to rewrite Discord request cwd for wt${worktree.id}: ${err.message} (original cwd: ${originalCwd})`);
    }

    // Route to worktree-specific Symphony bridge port
    // Each worktree runs its own Symphony bridge instance with isolated working directory
    // This ensures Discord commands execute in the appropriate worktree, not in main
    const targetPort = 4320 + worktree.id; // wt5->4325, wt6->4326, wt7->4327, wt8->4328
    
    const proxyReq = http.request(
      {
        hostname: "127.0.0.1",
        port: targetPort,
        path: "/v1/chat/completions",
        method: "POST",
        headers: {
          ...req.headers,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(proxyBody),
          "x-worktree-id": `wt${worktree.id}`,
          "x-worktree-path": worktree.path,
          // Pass Discord message ID for thread/reply functionality
          ...(discordMessageId ? { "x-discord-message-id": discordMessageId } : {}),
        },
      },
      (proxyRes) => {
        // Forward response headers
        res.writeHead(proxyRes.statusCode, proxyRes.headers);

        // Stream response back to client
        proxyRes.pipe(res, { end: true });
      },
    );

    // Add proxy request timeout (2 minutes)
    proxyReq.setTimeout(120000, () => {
      logError(`⏱️ Proxy request timeout to wt${worktree.id}`);
      proxyReq.destroy(new Error("Proxy timeout"));
    });

    // Track completion to prevent double-decrement when both error and close fire
    let completed = false;
    const cleanup = () => {
      if (completed) return;
      completed = true;
      worktree.activeRequests--;
      globalActiveRequests--;
      logDebug(
        `✅ Request complete (wt${worktree.id}, remaining: ${worktree.activeRequests}, global: ${globalActiveRequests})`,
      );
    };

    proxyReq.on("error", (err) => {
      cleanup();
      logError(`❌ Proxy error to wt${worktree.id}: ${err.message}`);

      // Only send error response if headers not yet sent
      // Check both writableEnded and headersSent to prevent ERR_HTTP_HEADERS_SENT
      if (!res.headersSent && !res.writableEnded) {
        res.writeHead(502, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: { message: `Worktree wt${worktree.id} unavailable: ${err.message}` },
          }),
        );
      } else {
        // Headers already sent, just close the connection
        res.end();
      }
    });

    proxyReq.on("close", () => {
      cleanup();
    });

    proxyReq.write(proxyBody);
    proxyReq.end();
  });

  req.on("error", (err) => {
    logError(`❌ Request error: ${err.message}`);
  });
}

/**
 * Health check endpoint
 */
function handleHealth(res) {
  const status = {
    status: "ok",
    maxConcurrent: MAX_CONCURRENT,
    activeRequests: globalActiveRequests,
    availableSlots: Math.max(0, MAX_CONCURRENT - globalActiveRequests),
    worktrees: WORKTREE_URLS.map((wt) => ({
      id: wt.id,
      path: wt.path,
      url: wt.url,
      activeRequests: wt.activeRequests,
      healthy: true, // Could add actual health check
    })),
  };

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(status));
}

/**
 * Main request handler
 */
const server = http.createServer((req, res) => {
  logDebug(`${req.method} ${req.url}`);

  // Health endpoint
  if (req.method === "GET" && (req.url === "/health" || req.url === "/")) {
    return handleHealth(res);
  }

  // Stats endpoint
  if (req.method === "GET" && req.url === "/stats") {
    return handleHealth(res);
  }

  // Only proxy chat completions
  if (req.method === "POST" && req.url === "/v1/chat/completions") {
    // Check if overloaded
    if (isOverloaded()) {
      logWarn(`🚫 Overload protection: ${globalActiveRequests}/${MAX_CONCURRENT} active`);
      return sendOverloadResponse(res);
    }

    // Find least loaded worktree
    const worktree = getLeastLoadedWorktree();

    if (!worktree) {
      logError("❌ No worktrees available");
      return sendOverloadResponse(res);
    }

    return proxyToWorktree(worktree, req, res);
  }

  // 404 for other endpoints
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: { message: "Not found" } }));
});

// Start server
server.listen(PORT, "127.0.0.1", () => {
  logInfo(`========================================`);
  logInfo(`Discord Request Router Starting`);
  logInfo(`========================================`);
  logInfo(`Listening: http://127.0.0.1:${PORT}`);
  logInfo(`Worktrees: wt${WORKTREE_IDS.join(", wt")}`);
  logInfo(`Max Concurrent: ${MAX_CONCURRENT}`);
  logInfo(`========================================`);

  // Send startup notification
  logInfo(`✅ Router ready to accept Discord requests`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logInfo("Received SIGTERM, shutting down...");
  server.close(() => process.exit(0));
});

process.on("SIGINT", () => {
  logInfo("Received SIGINT, shutting down...");
  server.close(() => process.exit(0));
});

export { server, getLeastLoadedWorktree, isOverloaded, globalActiveRequests };
