// Generated from ../../../../scripts/ops/integrations/model/linear-webhook-receiver.mjs:369

import http from "node:http";

import { handleHealth } from "./handle-health.mjs";
import { handleWebhook } from "./handle-webhook.mjs";
import { logDebug } from "./logger.mjs";

export const server = http.createServer((req, res) => {
  logDebug(`${req.method} ${req.url}`);

  // Health endpoint
  if (req.method === "GET" && (req.url === "/health" || req.url === "/")) {
    return handleHealth(res);
  }

  // Webhook endpoint
  if (req.method === "POST" && req.url === "/linear/webhook") {
    return handleWebhook(req, res);
  }

  // 404
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: { message: "Not found" } }));
});
