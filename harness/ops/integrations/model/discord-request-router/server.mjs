// Generated from ../../../../scripts/ops/integrations/model/discord-request-router.mjs:360

import http from "node:http";

import { MAX_CONCURRENT } from "./max-concurrent.mjs";
import { getLeastLoadedWorktree } from "./get-least-loaded-worktree.mjs";
import { globalActiveRequests } from "./global-active-requests.mjs";
import { handleHealth } from "./handle-health.mjs";
import { isOverloaded } from "./is-overloaded.mjs";
import { proxyToWorktree } from "./proxy-to-worktree.mjs";
import { sendOverloadResponse } from "./send-overload-response.mjs";
import { logWarn, logError, logDebug } from "./logger.mjs";

export const server = http.createServer((req, res) => {
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
