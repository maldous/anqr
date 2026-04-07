import { PROJECT_ROOT } from "../../../core/worktree-config.mjs";
import http from "node:http";

import { MAX_CONCURRENT } from "./max-concurrent.mjs";
import { getSessionThreadName } from "./get-session-thread-name.mjs";
import { globalActiveRequests, setGlobalActiveRequests } from "./global-active-requests.mjs";
import { rebaseCwdToWorktree } from "./rebase-cwd-to-worktree.mjs";
import { logInfo, logWarn, logError, logDebug } from "./logger.mjs";

export function processAndProxy(worktree, req, res, rawBody) {
  worktree.activeRequests++;
  setGlobalActiveRequests(globalActiveRequests + 1);

  logInfo(
    `📨 ROUTING: Discord request -> wt${worktree.id} | cwd: ${worktree.path} | active: ${worktree.activeRequests}/${globalActiveRequests}/${MAX_CONCURRENT}`,
  );

  let proxyBody = rawBody;

  let originalCwd = "(not provided)";
  let discordMessageId = null;
  let discordThreadName = null;
  try {
    const parsedBody = JSON.parse(rawBody || "{}");
    originalCwd = parsedBody.cwd || "(not provided)";
    parsedBody.cwd = rebaseCwdToWorktree(parsedBody.cwd, worktree.path);

    discordMessageId =
      parsedBody.discordMessageId ||
      parsedBody.message?.id ||
      parsedBody.messageId ||
      parsedBody.metadata?.discordMessageId ||
      null;

    if (discordMessageId) {
      logInfo(`📝 Discord message ID: ${discordMessageId}`);
    }

    const sessionId = req.headers["x-openclaw-session"] || null;
    discordThreadName = getSessionThreadName(sessionId, parsedBody.messages);
    if (discordThreadName) {
      logInfo(`🧵 Discord thread: "${discordThreadName}"`);
    }

    proxyBody = JSON.stringify(parsedBody);
    logInfo(
      `🧭 ROUTING: Discord request -> wt${worktree.id} | cwd: "${originalCwd}" -> "${parsedBody.cwd}" | port: 432${worktree.id}`,
    );

    if (parsedBody.cwd === PROJECT_ROOT) {
      logError(`🚨 ISOLATION VIOLATION: Request would write to main repo! cwd=${parsedBody.cwd}`);
    }
  } catch (err) {
    logWarn(
      `Failed to rewrite Discord request cwd for wt${worktree.id}: ${err.message} (original cwd: ${originalCwd})`,
    );
  }

  const targetPort = 4320 + worktree.id;

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
        ...(discordMessageId ? { "x-discord-message-id": discordMessageId } : {}),
        ...(discordThreadName
          ? { "x-discord-thread-name": encodeURIComponent(discordThreadName) }
          : {}),
      },
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    },
  );

  proxyReq.setTimeout(120000, () => {
    logError(`⏱️ Proxy request timeout to wt${worktree.id}`);
    proxyReq.destroy(new Error("Proxy timeout"));
  });

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

    if (!res.headersSent && !res.writableEnded) {
      res.writeHead(502, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: { message: `Worktree wt${worktree.id} unavailable: ${err.message}` },
        }),
      );
    } else {
      res.end();
    }
  });

  proxyReq.on("close", () => {
    cleanup();
  });

  proxyReq.write(proxyBody);
  proxyReq.end();
}
