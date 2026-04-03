#!/usr/bin/env node

/**
 * symphony-agent-router.mjs — Control-plane router for worktree-local Symphony bridges
 */

import http from "node:http";
import path from "node:path";
import { createLogger } from "../../lib/logger.mjs";
import { PROJECT_ROOT, getWorktreePath } from "../../core/worktree-config.mjs";

const { logInfo, logWarn, logError, logDebug } = createLogger();

const PORT = Number(process.env.SYMPHONY_AGENT_PORT || process.env.SYMPHONY_BRIDGE_PORT || 4319);
const WORKTREE_IDS = String(process.env.SYMPHONY_AGENT_WORKTREES || "1,2,3,4,5,6,7,8")
  .split(",")
  .map((value) => Number.parseInt(value.trim(), 10))
  .filter((value) => Number.isFinite(value));
const MAX_CONCURRENT = Number.parseInt(process.env.SYMPHONY_AGENT_MAX_CONCURRENT || "8", 10);
const TARGET_HOST = process.env.SYMPHONY_AGENT_TARGET_HOST || "127.0.0.1";

const WORKTREES = WORKTREE_IDS.map((id) => ({
  id,
  path: getWorktreePath(id),
  port: 4320 + id,
  activeRequests: 0,
  failures: 0,
}));

let globalActiveRequests = 0;
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
    return path.resolve(worktreePath, path.relative(PROJECT_ROOT, resolved));
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

function selectWorktree(req, parsedBody) {
  const requestedWorktree =
    req.headers["x-worktree-id"] || parsedBody?.worktreeId || parsedBody?.worktree_id;
  if (requestedWorktree) {
    const normalized = String(requestedWorktree).replace(/^wt/, "");
    const found = WORKTREES.find((worktree) => String(worktree.id) === normalized);
    if (found) return found;
  }

  if (WORKTREES.length === 0) return null;

  // Find minimum load, then round-robin among equally-loaded worktrees
  const sorted = WORKTREES.slice().sort((a, b) => {
    if (a.activeRequests !== b.activeRequests) return a.activeRequests - b.activeRequests;
    return a.failures - b.failures;
  });
  const minLoad = sorted[0].activeRequests;
  const minFailures = sorted[0].failures;
  const candidates = sorted.filter(
    (wt) => wt.activeRequests === minLoad && wt.failures === minFailures,
  );

  const selected = candidates[roundRobinIndex % candidates.length];
  roundRobinIndex = (roundRobinIndex + 1) % WORKTREES.length;
  return selected;
}

function json(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

function overload(res) {
  json(res, 429, {
    error: {
      message: "Symphony agent is at concurrent capacity. Please retry shortly.",
      type: "overloaded",
    },
  });
}

function proxyRequest(target, req, res, parsedBody = {}) {
  target.activeRequests += 1;
  globalActiveRequests += 1;

  const rewrittenBody = {
    ...parsedBody,
    cwd: rebaseCwdToWorktree(parsedBody.cwd, target.path),
    worktreeId: `wt${target.id}`,
    worktreePath: target.path,
  };
  const proxyBody = JSON.stringify(rewrittenBody);

  logInfo(
    `📨 Router -> wt${target.id} (${target.activeRequests}/${globalActiveRequests}/${MAX_CONCURRENT})`,
  );

  const proxyReq = http.request(
    {
      hostname: TARGET_HOST,
      port: target.port,
      path: req.url,
      method: req.method,
      headers: {
        ...req.headers,
        "content-type": "application/json",
        "content-length": Buffer.byteLength(proxyBody),
        "x-worktree-id": `wt${target.id}`,
        "x-worktree-path": target.path,
      },
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
      proxyRes.on("end", () => {
        target.activeRequests = Math.max(0, target.activeRequests - 1);
        globalActiveRequests = Math.max(0, globalActiveRequests - 1);
      });
    },
  );

  proxyReq.setTimeout(30 * 60 * 1000, () => {
    proxyReq.destroy(new Error(`Timed out waiting for wt${target.id}`));
  });

  proxyReq.on("error", (err) => {
    target.failures += 1;
    target.activeRequests = Math.max(0, target.activeRequests - 1);
    globalActiveRequests = Math.max(0, globalActiveRequests - 1);
    logError(`❌ Router -> wt${target.id} failed: ${err.message}`);
    if (!res.writableEnded) {
      json(res, 502, {
        error: {
          message: `Worktree wt${target.id} unavailable: ${err.message}`,
          type: "bad_gateway",
        },
      });
    }
  });

  proxyReq.write(proxyBody);
  proxyReq.end();
}

// Linear webhook event handling
import { spawn } from "node:child_process";

const linearQueue = [];
const MAX_QUEUE_LENGTH = 50;
const MAX_QUEUE_AGE_MS = 5 * 60 * 1000; // 5 minutes TTL
const QUEUE_POLL_INTERVAL_MS = 5000;

// Process queued triggers periodically - spawn runners when worktrees become available
setInterval(() => {
  if (linearQueue.length === 0) return;

  // Drop stale items older than MAX_QUEUE_AGE_MS
  const now = Date.now();
  const initialLength = linearQueue.length;
  for (let i = linearQueue.length - 1; i >= 0; i--) {
    const age = now - new Date(linearQueue[i].queuedAt).getTime();
    if (age > MAX_QUEUE_AGE_MS) {
      logWarn(`Dropping stale queued trigger: ${linearQueue[i].identifier} (age: ${Math.round(age/1000)}s)`);
      linearQueue.splice(i, 1);
    }
  }
  if (linearQueue.length < initialLength) {
    logInfo(`Queue TTL: dropped ${initialLength - linearQueue.length} stale items`);
  }

  const linearWorktrees = WORKTREES.filter((w) => w.id >= 1 && w.id <= 4);
  const available = linearWorktrees.filter((w) => w.activeRequests < 1);

  if (available.length === 0) {
    logDebug(`Queue length: ${linearQueue.length}, no worktrees available`);
    return;
  }

  // Process up to available slots
  const toProcess = linearQueue.splice(0, available.length);
  for (const item of toProcess) {
    logInfo(`Processing queued trigger: ${item.identifier}`);
    spawnLinearRunner(item.identifier);
  }
}, QUEUE_POLL_INTERVAL_MS);

function spawnLinearRunner(identifier) {
  const linearWorktrees = WORKTREES.filter((w) => w.id >= 1 && w.id <= 4);
  const target = linearWorktrees.sort((a, b) => a.activeRequests - b.activeRequests)[0];

  if (!target || target.activeRequests >= 1) {
    if (linearQueue.length >= MAX_QUEUE_LENGTH) {
      logWarn(`Queue full, dropping re-queue for ${identifier}`);
      return;
    }
    logWarn(`No available worktree for ${identifier}, re-queuing`);
    linearQueue.push({ identifier, queuedAt: new Date().toISOString() });
    return;
  }

  logInfo(`Linear trigger: ${identifier} -> spawning runner in wt${target.id}`);

  // Increment active requests so subsequent triggers route to other worktrees
  target.activeRequests += 1;
  globalActiveRequests += 1;
  logInfo(`Linear worktree load: wt1=${WORKTREES[0].activeRequests}, wt2=${WORKTREES[1].activeRequests}, wt3=${WORKTREES[2].activeRequests}, wt4=${WORKTREES[3].activeRequests}`);

  // Spawn the runner in the target worktree
  const nodePath = process.execPath || "/home/user/.nvm/versions/node/v25.8.0/bin/node";
  
  const runner = spawn(
    nodePath,
    [
      "scripts/ops/orchestration/symphony-runner.mjs",
      "--once",
      "--issue",
      identifier,
    ],
    {
      cwd: target.path,
      env: {
        ...process.env,
        ANQR_WORKTREE_ID: `wt${target.id}`,
        ANQR_WORKTREE_PATH: target.path,
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  runner.stdout.on("data", (data) => logInfo(`[runner-wt${target.id}] ${data}`));
  runner.stderr.on("data", (data) => logError(`[runner-wt${target.id}] ${data}`));
  runner.on("close", (code) => {
    target.activeRequests = Math.max(0, target.activeRequests - 1);
    globalActiveRequests = Math.max(0, globalActiveRequests - 1);
    logInfo(`Runner for ${identifier} exited with code ${code} (load: wt1=${WORKTREES[0].activeRequests}, wt2=${WORKTREES[1].activeRequests}, wt3=${WORKTREES[2].activeRequests}, wt4=${WORKTREES[3].activeRequests})`);
  });
  runner.on("error", (err) => {
    target.activeRequests = Math.max(0, target.activeRequests - 1);
    globalActiveRequests = Math.max(0, globalActiveRequests - 1);
    logError(`Failed to spawn runner for ${identifier}: ${err.message}`);
  });
}

function handleLinearTrigger(req, res) {
  // Only route to Linear worktrees (wt1-4)
  const linearWorktrees = WORKTREES.filter((w) => w.id >= 1 && w.id <= 4);
  if (linearWorktrees.length === 0) {
    logError("No Linear worktrees available for trigger");
    json(res, 503, { error: { message: "No worktrees available" } });
    return;
  }

  // Select least-loaded Linear worktree
  const target = linearWorktrees.sort((a, b) => a.activeRequests - b.activeRequests)[0];

  // Read the request body to get identifier
  const chunks = [];
  req.on("data", (chunk) => chunks.push(chunk));
  req.on("end", () => {
    let parsedBody = {};
    try {
      parsedBody = JSON.parse(Buffer.concat(chunks).toString());
    } catch (err) {
      logError(`Invalid JSON in trigger: ${err.message}`);
      json(res, 400, { error: { message: "Invalid JSON" } });
      return;
    }

    const identifier = parsedBody.identifier || req.headers["x-linear-identifier"];
    if (!identifier) {
      logError("Missing identifier in trigger");
      json(res, 400, { error: { message: "Missing identifier" } });
      return;
    }

    // If all worktrees are busy, queue the trigger
    if (target.activeRequests >= 1) {
      if (linearQueue.length >= MAX_QUEUE_LENGTH) {
        logWarn(`Linear trigger queue full (${MAX_QUEUE_LENGTH}), dropping trigger for ${identifier}`);
        json(res, 503, { error: { message: "Queue full, try again later" } });
        return;
      }
      logInfo(`All Linear worktrees busy, queuing ${identifier} (queue length: ${linearQueue.length + 1})`);
      linearQueue.push({ identifier, queuedAt: new Date().toISOString() });
      json(res, 202, { status: "queued", queueLength: linearQueue.length });
      return;
    }

    // Spawn the runner
    json(res, 202, { status: "accepted" });
    spawnLinearRunner(identifier);
  });

  req.on("error", (err) => {
    logError(`Linear trigger request error: ${err.message}`);
  });
}

function handleLinearQueue(req, res) {
  // POST /v1/linear/queue - add event to queue
  if (req.method === "POST") {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      try {
        const event = JSON.parse(Buffer.concat(chunks).toString());
        linearQueue.push({
          ...event,
          queuedAt: new Date().toISOString(),
        });
        logInfo(`Queued Linear event: ${event.event?.identifier}`);
        return json(res, 202, { status: "queued", queueLength: linearQueue.length });
      } catch (err) {
        return json(res, 400, { error: { message: `Invalid JSON: ${err.message}` } });
      }
    });
    return;
  }

  // GET /v1/linear/queue - get queue status
  if (req.method === "GET") {
    return json(res, 200, {
      queueLength: linearQueue.length,
      events: linearQueue.slice(-10).map((e) => ({
        identifier: e.event?.identifier,
        action: e.event?.action,
        queuedAt: e.queuedAt,
      })),
    });
  }

  // DELETE /v1/linear/queue - clear queue
  if (req.method === "DELETE") {
    const cleared = linearQueue.length;
    linearQueue.length = 0;
    return json(res, 200, { status: "cleared", clearedCount: cleared });
  }

  json(res, 405, { error: { message: "Method not allowed" } });
}

const server = http.createServer((req, res) => {
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

  if (req.method !== "POST" || (req.url !== "/v1/chat/completions" && req.url !== "/chat/completions")) {
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

server.listen(PORT, TARGET_HOST, () => {
  logInfo(`========================================`);
  logInfo(`Symphony Agent Router Starting`);
  logInfo(`========================================`);
  logInfo(`Listening: http://${TARGET_HOST}:${PORT}`);
  logInfo(`Routing worktrees: wt${WORKTREE_IDS.join(", wt")}`);
  logInfo(`Max concurrent: ${MAX_CONCURRENT}`);
  logInfo(`========================================`);
});

process.on("SIGTERM", () => server.close(() => process.exit(0)));
process.on("SIGINT", () => server.close(() => process.exit(0)));
