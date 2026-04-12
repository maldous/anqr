import http from "node:http";

import { recordRoutingDecision, recordWorktreeSelection } from "../../../core/task-evidence.mjs";

import { MAX_QUEUE_LENGTH } from "./max-queue-length.mjs";
import { TARGET_HOST } from "./target-host.mjs";
import { globalActiveRequests, setGlobalActiveRequests } from "./global-active-requests.mjs";
import { linearQueue } from "./linear-queue.mjs";
import { selectLinearWorktree } from "./select-linear-worktree.mjs";
import { logInfo, logWarn, logError } from "./logger.mjs";

export function dispatchLinearExecution(identifier, correlationId) {
  const target = selectLinearWorktree();

  if (!target || target.activeRequests >= 1) {
    if (linearQueue.length >= MAX_QUEUE_LENGTH) {
      logWarn(`Queue full, dropping re-queue for ${identifier}`);
      return;
    }
    logWarn(`No available worktree for ${identifier}, re-queuing`);
    linearQueue.enqueue({ identifier, correlationId, queuedAt: new Date().toISOString() });

    if (correlationId) {
      try {
        recordRoutingDecision(correlationId, {
          targetWorktreePool: "linear-wt1-4",
          routingStrategy: "queued",
          queuePosition: linearQueue.length,
        });
      } catch {
        /* best-effort evidence */
      }
    }
    return;
  }

  if (correlationId) {
    try {
      recordRoutingDecision(correlationId, {
        targetWorktreePool: "linear-wt1-4",
        routingStrategy: "least-loaded",
      });
      recordWorktreeSelection(correlationId, {
        worktreeId: `wt${target.id}`,
        reason: "least-loaded-linear",
      });
    } catch {
      /* best-effort evidence */
    }
  }

  target.activeRequests += 1;
  setGlobalActiveRequests(globalActiveRequests + 1);
  logInfo(
    `Linear trigger: ${identifier} -> wt${target.id} executor [${correlationId || "no-correlation"}]`,
  );

  const proxyBody = JSON.stringify({ identifier, source: "linear-webhook" });
  const proxyReq = http.request(
    {
      hostname: TARGET_HOST,
      port: target.port,
      path: "/v1/linear/execute",
      method: "POST",
      headers: {
        "content-type": "application/json",
        "content-length": Buffer.byteLength(proxyBody),
        authorization: "Bearer local-symphony",
        "x-worktree-id": `wt${target.id}`,
        "x-worktree-path": target.path,
        "x-linear-identifier": identifier,
        ...(correlationId ? { "x-anqr-correlation-id": correlationId } : {}),
      },
    },
    (proxyRes) => {
      proxyRes.resume();
      proxyRes.on("end", () => {
        target.activeRequests = Math.max(0, target.activeRequests - 1);
        setGlobalActiveRequests(Math.max(0, globalActiveRequests - 1));
        logInfo(
          `Linear execution for ${identifier} completed via wt${target.id} (${proxyRes.statusCode || 0})`,
        );
      });
    },
  );

  proxyReq.setTimeout(30 * 60 * 1000, () => {
    proxyReq.destroy(new Error(`Timed out waiting for wt${target.id}`));
  });

  proxyReq.on("error", (err) => {
    target.failures += 1;
    target.activeRequests = Math.max(0, target.activeRequests - 1);
    setGlobalActiveRequests(Math.max(0, globalActiveRequests - 1));
    logError(`Failed to dispatch ${identifier} to wt${target.id}: ${err.message}`);
  });

  proxyReq.write(proxyBody);
  proxyReq.end();
}
