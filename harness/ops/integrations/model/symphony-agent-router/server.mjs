import http from "node:http";

import { MAX_CONCURRENT } from "./max-concurrent.mjs";
import { TARGET_HOST } from "./target-host.mjs";
import { WORKTREES } from "./worktrees.mjs";
import { globalActiveRequests } from "./global-active-requests.mjs";
import { handleLinearQueue } from "./handle-linear-queue.mjs";
import { handleLinearTrigger } from "./handle-linear-trigger.mjs";
import { json } from "./json.mjs";
import { linearQueue } from "./linear-queue.mjs";
import { overload } from "./overload.mjs";
import { proxyRequest } from "./proxy-request.mjs";
import { selectWorktree } from "./select-worktree.mjs";
import { logWarn, logError, logDebug } from "./logger.mjs";

export const server = http.createServer((req, res) => {
  logDebug(`${req.method} ${req.url}`);

  // Linear webhook endpoints
  if (req.url === "/v1/linear/trigger") {
    return handleLinearTrigger(req, res);
  }
  if (req.url === "/v1/linear/queue") {
    return handleLinearQueue(req, res);
  }

  if (req.method === "GET" && (req.url === "/" || req.url === "/health" || req.url === "/stats")) {
    return json(res, 200, {
      status: "ok",
      role: "symphony-agent-router",
      activeRequests: globalActiveRequests,
      maxConcurrent: MAX_CONCURRENT,
      queueLength: linearQueue.length,
      worktrees: WORKTREES.map((worktree) => ({
        id: `wt${worktree.id}`,
        path: worktree.path,
        port: worktree.port,
        activeRequests: worktree.activeRequests,
        failures: worktree.failures,
      })),
    });
  }

  if (req.method === "GET" && req.url === "/v1/models") {
    const target = WORKTREES[0];
    if (!target) {
      return json(res, 503, { error: { message: "No worktrees configured" } });
    }
    const proxyReq = http.request(
      {
        hostname: TARGET_HOST,
        port: target.port,
        path: req.url,
        method: req.method,
        headers: req.headers,
      },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
        proxyRes.pipe(res, { end: true });
      },
    );
    proxyReq.on("error", (err) => {
      json(res, 502, {
        error: { message: `Failed to fetch models from wt${target.id}: ${err.message}` },
      });
    });
    proxyReq.end();
    return;
  }

  if (
    req.method !== "POST" ||
    (req.url !== "/v1/chat/completions" && req.url !== "/chat/completions")
  ) {
    return json(res, 404, { error: { message: "Not found" } });
  }

  if (globalActiveRequests >= MAX_CONCURRENT) {
    return overload(res);
  }

  const chunks = [];
  req.on("data", (chunk) => chunks.push(chunk));
  req.on("end", () => {
    const rawBody = Buffer.concat(chunks).toString("utf-8");
    let parsedBody = {};
    try {
      parsedBody = rawBody ? JSON.parse(rawBody) : {};
    } catch (err) {
      logWarn(`Invalid request body: ${err.message}`);
      return json(res, 400, { error: { message: `Invalid JSON body: ${err.message}` } });
    }

    const target = selectWorktree(req, parsedBody);
    if (!target) {
      return json(res, 503, { error: { message: "No worktree bridges available" } });
    }

    proxyRequest(target, req, res, parsedBody);
  });

  req.on("error", (err) => {
    logError(`Incoming request error: ${err.message}`);
  });
});
