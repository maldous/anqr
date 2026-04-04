// Generated from ../../../../scripts/ops/runtime/mcp/context7-http-service.mjs:95

import { resolveDocsLocally, isContext7ServerHealthy } from "../context7-server.mjs";

import { readBody } from "./read-body.mjs";
import { sendJSON } from "./send-json.mjs";
import { startedAt } from "./started-at.mjs";
import { logDebug, logError } from "./logger.mjs";

export async function handleRequest(req, res) {
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
