#!/usr/bin/env node

/**
 * context7-http-service.mjs — Standalone HTTP service for Context7 documentation
 *
 * Wraps the local Context7 MCP server (via context7-server.mjs) and exposes
 * a simple HTTP API that other services (Symphony Bridge, etc.) can call
 * instead of spawning their own MCP child processes.
 *
 * Endpoints:
 *   POST /v1/resolve-docs  — Resolve library documentation
 *     Body: { libraryTitle: string, topic?: string, max_tokens?: number }
 *     Response: { source: string, documentation: string | null }
 *
 *   GET /health             — Health check (no auth required)
 *     Response: { status: "ok"|"degraded", serverReady: boolean, uptime: number }
 *
 * Environment:
 *   CONTEXT7_HTTP_PORT          — Port to listen on (default: 4320)
 *   CONTEXT7_API_KEY            — API key for cloud API fallback
 *   CONTEXT7_STARTUP_TIMEOUT_MS — MCP server startup timeout (default: 15000)
 *   CONTEXT7_REQUEST_TIMEOUT_MS — Per-request timeout (default: 30000)
 *
 * Usage:
 *   node scripts/ops/runtime/mcp/context7-http-service.mjs [--port 4320]
 *
 * Install as user service:
 *   cp services/systemd/anqr-context7-mcp.service ~/.config/systemd/user/
 *   systemctl --user daemon-reload
 *   systemctl --user enable --now anqr-context7-mcp.service
 */

import http from "node:http";
import { createLogger } from "../../lib/logger.mjs";
import {
  startContext7Server,
  stopContext7Server,
  resolveDocsLocally,
  isContext7ServerHealthy,
} from "./context7-server.mjs";

const { logDebug, logInfo, logWarn, logError } = createLogger("context7-http");

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const PORT = Number.parseInt(
  process.argv.find((a, i) => process.argv[i - 1] === "--port") ||
  process.env.CONTEXT7_HTTP_PORT ||
  "4320",
  10,
);

const startedAt = Date.now();

// ---------------------------------------------------------------------------
// HTTP request handler
// ---------------------------------------------------------------------------

/**
 * Read the full request body as a string.
 * @param {http.IncomingMessage} req
 * @returns {Promise<string>}
 */
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    req.on("error", reject);
  });
}

/**
 * Send a JSON response.
 * @param {http.ServerResponse} res
 * @param {number} status
 * @param {object} data
 */
function sendJSON(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
}

/**
 * Handle incoming HTTP requests.
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
async function handleRequest(req, res) {
  const { method, url } = req;
  logDebug(`${method} ${url}`);

  // Health check — no auth required
  if (url === "/health" && method === "GET") {
    const healthy = await isContext7ServerHealthy();
    sendJSON(res, 200, {
      status: healthy ? "ok" : "degraded",
      serverReady: healthy,
      uptime: Math.round((Date.now() - startedAt) / 1000),
    });
    return;
  }

  // POST /v1/resolve-docs
  if (url === "/v1/resolve-docs" && method === "POST") {
    try {
      const rawBody = await readBody(req);
      const body = JSON.parse(rawBody);

      if (!body.libraryTitle) {
        sendJSON(res, 400, { error: "Missing required field: libraryTitle" });
        return;
      }

      const result = await resolveDocsLocally({
        libraryTitle: body.libraryTitle,
        topic: body.topic,
        max_tokens: body.max_tokens || 5000,
      });

      sendJSON(res, 200, result);
    } catch (err) {
      logError(`/v1/resolve-docs error: ${err.message}`);
      sendJSON(res, 500, { error: err.message, source: "error", documentation: null });
    }
    return;
  }

  // 404 for everything else
  sendJSON(res, 404, { error: "Not found" });
}

// ---------------------------------------------------------------------------
// Server lifecycle
// ---------------------------------------------------------------------------

const server = http.createServer(handleRequest);
server.timeout = 0;
server.keepAliveTimeout = 0;

// Graceful shutdown
async function shutdown(signal) {
  logInfo(`Received ${signal}, shutting down...`);
  await stopContext7Server();
  server.close(() => {
    logInfo("HTTP server closed");
  });
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM").catch(() => process.exit(1)));
process.on("SIGINT", () => shutdown("SIGINT").catch(() => process.exit(1)));

// Start
server.listen(PORT, "127.0.0.1", async () => {
  logInfo("========================================");
  logInfo("Context7 HTTP Service Starting");
  logInfo("========================================");
  logInfo(`Listening: http://127.0.0.1:${PORT}`);
  logInfo(`Endpoints: POST /v1/resolve-docs, GET /health`);

  // Start the MCP server
  const ok = await startContext7Server();
  if (ok) {
    logInfo("✅ Context7 MCP server started successfully");
  } else {
    logWarn("⚠️ Context7 MCP server failed to start — will use cloud API fallback");
  }

  logInfo("========================================");
  logInfo("Ready to accept requests");
  logInfo("========================================");
});
