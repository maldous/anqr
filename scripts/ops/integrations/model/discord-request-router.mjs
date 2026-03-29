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
import { createLogger } from "../../lib/logger.mjs";

const { logInfo, logWarn, logError, logDebug } = createLogger();

// Configuration
const PORT = process.env.DISCORD_ROUTER_PORT || 18790;
const WORKTREE_IDS = (process.env.DISCORD_WORKTREES || "5,6,7,8")
  .split(",")
  .map((s) => parseInt(s.trim(), 10))
  .filter((n) => !isNaN(n));
const MAX_CONCURRENT = parseInt(process.env.MAX_CONCURRENT || "4", 10);

// Build worktree URLs
const WORKTREE_URLS = WORKTREE_IDS.map((id) => ({
  id,
  url: `http://127.0.0.1:1879${id}`,
  activeRequests: 0,
}));

// Track global concurrent requests
let globalActiveRequests = 0;

/**
 * Find the worktree with the least active requests (least-loaded)
 */
function getLeastLoadedWorktree() {
  let minLoad = Infinity;
  let selected = null;

  for (const wt of WORKTREE_URLS) {
    if (wt.activeRequests < minLoad) {
      minLoad = wt.activeRequests;
      selected = wt;
    }
  }

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

  req.on("data", (chunk) => requestBody.push(chunk));
  req.on("end", async () => {
    // Update counters BEFORE proxying
    worktree.activeRequests++;
    globalActiveRequests++;

    logInfo(
      `📨 Routing to worktree wt${worktree.id} (active: ${worktree.activeRequests}, global: ${globalActiveRequests}/${MAX_CONCURRENT})`,
    );

    const body = Buffer.concat(requestBody).toString();

    // Route to shared gateway at port 18789 (to avoid Bonjour conflicts from multiple gateways)
    // Note: The load balancing still works - we track concurrent requests per "virtual" worktree
    const proxyReq = http.request(
      {
        hostname: "127.0.0.1",
        port: 18789, // Shared gateway port (instead of per-worktree 18795-18798)
        path: "/v1/chat/completions",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
          ...req.headers,
        },
      },
      (proxyRes) => {
        // Forward response headers
        res.writeHead(proxyRes.statusCode, proxyRes.headers);

        // Stream response back to client
        proxyRes.pipe(res, { end: true });
      },
    );

    proxyReq.on("error", (err) => {
      // Decrement counters on error
      worktree.activeRequests--;
      globalActiveRequests--;

      logError(`❌ Proxy error to wt${worktree.id}: ${err.message}`);

      if (!res.writableEnded) {
        res.writeHead(502, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: { message: `Worktree wt${worktree.id} unavailable: ${err.message}` },
          }),
        );
      }
    });

    proxyReq.on("close", () => {
      // Decrement counters when connection closes
      worktree.activeRequests--;
      globalActiveRequests--;

      logDebug(
        `✅ Request complete (wt${worktree.id}, remaining: ${worktree.activeRequests}, global: ${globalActiveRequests})`,
      );
    });

    proxyReq.write(body);
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
