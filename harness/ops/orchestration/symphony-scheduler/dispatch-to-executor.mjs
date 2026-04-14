import http from "node:http";
import { logWarn } from "./logger.mjs";

const ROUTER_HOST = "127.0.0.1";
const ROUTER_PORT = 4319;

/**
 * Dispatch a claimed issue to its assigned worktree executor via the router.
 */
export function dispatchToExecutor(identifier, correlationId) {
  return new Promise((resolve) => {
    const body = JSON.stringify({
      identifier,
      source: "scheduler",
      timestamp: new Date().toISOString(),
    });

    const req = http.request(
      {
        hostname: ROUTER_HOST,
        port: ROUTER_PORT,
        path: "/v1/linear/trigger",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
          Authorization: "Bearer local-symphony",
          ...(correlationId ? { "x-anqr-correlation-id": correlationId } : {}),
        },
      },
      (res) => {
        res.resume();
        res.on("end", () => resolve(res.statusCode < 400));
      },
    );

    req.on("error", (err) => {
      logWarn(`[scheduler] Dispatch failed for ${identifier}: ${err.message}`);
      resolve(false);
    });

    req.setTimeout(10_000, () => {
      req.destroy(new Error("timeout"));
      resolve(false);
    });

    req.write(body);
    req.end();
  });
}
