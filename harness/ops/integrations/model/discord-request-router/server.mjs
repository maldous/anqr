import http from "node:http";

import { MAX_CONCURRENT } from "./max-concurrent.mjs";
import { getLeastLoadedWorktree } from "./get-least-loaded-worktree.mjs";
import { globalActiveRequests } from "./global-active-requests.mjs";
import { handleHealth } from "./handle-health.mjs";
import { isOverloaded } from "./is-overloaded.mjs";
import { proxyToWorktree } from "./proxy-to-worktree.mjs";
import { isOpenClawDirectiveBody } from "./is-openclaw-directive-body.mjs";
import { sendDirectiveAck } from "./send-directive-ack.mjs";
import { sendOverloadResponse } from "./send-overload-response.mjs";
import { logInfo, logWarn, logError, logDebug } from "./logger.mjs";

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

    // Buffer request body BEFORE worktree selection so we can intercept
    // OpenClaw directives without consuming a worktree slot or advancing round-robin.
    const MAX_BODY_BYTES = 10_000_000;
    const chunks = [];
    let totalBytes = 0;
    let aborted = false;
    req.on("data", (chunk) => {
      totalBytes += chunk.length;
      if (totalBytes > MAX_BODY_BYTES) {
        if (!aborted) {
          aborted = true;
          logWarn(`🚫 Request body exceeds ${MAX_BODY_BYTES} bytes, rejecting`);
          res.writeHead(413, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: { message: "Request body too large" } }));
          req.destroy();
        }
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      if (aborted) return;
      const rawBody = Buffer.concat(chunks).toString();

      // Intercept OpenClaw directives at router level
      if (isOpenClawDirectiveBody(rawBody)) {
        logInfo("🔇 Intercepted OpenClaw directive at router (no worktree consumed)");
        return sendDirectiveAck(res, rawBody);
      }

      const sessionId =
        req.headers["x-openclaw-session"] || req.headers["x-openclaw-session-key"] || null;

      logInfo(
        `🔑 Session: ${sessionId || "(no session)"} | active: ${globalActiveRequests}/${MAX_CONCURRENT}`,
      );

      // Find least loaded worktree, but keep a sticky worktree per session to preserve
      // executor-local session/provider state across Discord follow-up turns.
      const worktree = getLeastLoadedWorktree(sessionId);

      if (!worktree) {
        logError("❌ No worktrees available");
        return sendOverloadResponse(res);
      }

      proxyToWorktree(worktree, req, res, rawBody);
    });
    req.on("error", (err) => {
      logError(`❌ Request body error: ${err.message}`);
    });
    return; // Prevent fall-through to 404 while body streams
  }

  // 404 for other endpoints
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: { message: "Not found" } }));
});
