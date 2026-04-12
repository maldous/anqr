import http from "node:http";

import { MAX_CONCURRENT } from "./max-concurrent.mjs";
import { TARGET_HOST } from "./target-host.mjs";
import { globalActiveRequests, setGlobalActiveRequests } from "./global-active-requests.mjs";
import { json } from "./json.mjs";
import { rebaseCwdToWorktree } from "./rebase-cwd-to-worktree.mjs";
import { logInfo, logError } from "./logger.mjs";

export function proxyRequest(target, req, res, parsedBody = {}) {
  target.activeRequests += 1;
  setGlobalActiveRequests(globalActiveRequests + 1);

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

  // Preserve correlation ID through the proxy for end-to-end traceability
  const correlationId = req.headers["x-anqr-correlation-id"] || null;

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
        ...(correlationId ? { "x-anqr-correlation-id": correlationId } : {}),
      },
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
      proxyRes.on("end", () => {
        target.activeRequests = Math.max(0, target.activeRequests - 1);
        setGlobalActiveRequests(Math.max(0, globalActiveRequests - 1));
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
