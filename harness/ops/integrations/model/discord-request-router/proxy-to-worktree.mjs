import { PROJECT_ROOT } from "../../../core/worktree-config.mjs";
import http from "node:http";

import { MAX_CONCURRENT } from "./max-concurrent.mjs";
import { getSessionThreadName } from "./get-session-thread-name.mjs";
import { globalActiveRequests, setGlobalActiveRequests } from "./global-active-requests.mjs";
import { rebaseCwdToWorktree } from "./rebase-cwd-to-worktree.mjs";
import { logInfo, logWarn, logError, logDebug } from "./logger.mjs";

export function proxyToWorktree(worktree, req, res) {
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
    setGlobalActiveRequests(globalActiveRequests + 1);

    logInfo(
      `📨 ROUTING: Discord request -> wt${worktree.id} | cwd: ${worktree.path} | active: ${worktree.activeRequests}/${globalActiveRequests}/${MAX_CONCURRENT}`,
    );

    const rawBody = Buffer.concat(requestBody).toString();
    let proxyBody = rawBody;

    let originalCwd = "(not provided)";
    let discordMessageId = null;
    let discordThreadName = null;
    try {
      const parsedBody = JSON.parse(rawBody || "{}");
      originalCwd = parsedBody.cwd || "(not provided)";
      parsedBody.cwd = rebaseCwdToWorktree(parsedBody.cwd, worktree.path);

      // Extract Discord message ID from the request for thread/reply functionality
      discordMessageId =
        parsedBody.discordMessageId ||
        parsedBody.message?.id ||
        parsedBody.messageId ||
        parsedBody.metadata?.discordMessageId ||
        null;

      if (discordMessageId) {
        logInfo(`📝 Discord message ID: ${discordMessageId}`);
      }

      // Generate a Discord thread name from the user's message for thread-based conversations
      const sessionId = req.headers["x-openclaw-session"] || null;
      discordThreadName = getSessionThreadName(sessionId, parsedBody.messages);
      if (discordThreadName) {
        logInfo(`🧵 Discord thread: "${discordThreadName}"`);
      }

      proxyBody = JSON.stringify(parsedBody);
      logInfo(
        `🧭 ROUTING: Discord request -> wt${worktree.id} | cwd: "${originalCwd}" -> "${parsedBody.cwd}" | port: 432${worktree.id}`,
      );

      // CRITICAL ISOLATION CHECK: Log warning if cwd would result in main repo access
      // Only check for exact main repo path, NOT worktree paths (which also start with /home/user/src/anqr)
      if (parsedBody.cwd === PROJECT_ROOT) {
        logError(`🚨 ISOLATION VIOLATION: Request would write to main repo! cwd=${parsedBody.cwd}`);
      }
    } catch (err) {
      logWarn(
        `Failed to rewrite Discord request cwd for wt${worktree.id}: ${err.message} (original cwd: ${originalCwd})`,
      );
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
          // Pass Discord message ID and thread name for thread/reply functionality
          ...(discordMessageId ? { "x-discord-message-id": discordMessageId } : {}),
          ...(discordThreadName
            ? { "x-discord-thread-name": encodeURIComponent(discordThreadName) }
            : {}),
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
      setGlobalActiveRequests(globalActiveRequests - 1);
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
