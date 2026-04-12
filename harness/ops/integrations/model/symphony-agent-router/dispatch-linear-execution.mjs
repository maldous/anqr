import http from "node:http";

import { MAX_QUEUE_LENGTH } from "./max-queue-length.mjs";
import { TARGET_HOST } from "./target-host.mjs";
import { globalActiveRequests, setGlobalActiveRequests } from "./global-active-requests.mjs";
import { linearQueue } from "./linear-queue.mjs";
import { selectLinearWorktree } from "./select-linear-worktree.mjs";
import { logInfo, logWarn, logError } from "./logger.mjs";

export function dispatchLinearExecution(identifier) {
  const target = selectLinearWorktree();

  if (!target || target.activeRequests >= 1) {
    if (linearQueue.length >= MAX_QUEUE_LENGTH) {
      logWarn(`Queue full, dropping re-queue for ${identifier}`);
      return;
    }
    logWarn(`No available worktree for ${identifier}, re-queuing`);
    linearQueue.enqueue({ identifier, queuedAt: new Date().toISOString() });
    return;
  }

  target.activeRequests += 1;
  setGlobalActiveRequests(globalActiveRequests + 1);
  logInfo(`Linear trigger: ${identifier} -> wt${target.id} executor`);

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
