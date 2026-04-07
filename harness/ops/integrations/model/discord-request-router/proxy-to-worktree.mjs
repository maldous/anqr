import { processAndProxy } from "./process-and-proxy.mjs";
import { logWarn, logError } from "./logger.mjs";

export function proxyToWorktree(worktree, req, res, preBufferedBody = null) {
  if (preBufferedBody !== null) {
    processAndProxy(worktree, req, res, preBufferedBody);
    return;
  }

  // Fallback: buffer from stream (legacy path)
  const requestBody = [];

  req.setTimeout(120000, () => {
    logWarn(`⏱️ Incoming request timeout for wt${worktree.id}`);
    req.destroy(new Error("Request timeout"));
  });

  req.on("data", (chunk) => requestBody.push(chunk));
  req.on("end", () => {
    const rawBody = Buffer.concat(requestBody).toString();
    processAndProxy(worktree, req, res, rawBody);
  });

  req.on("error", (err) => {
    logError(`❌ Request error: ${err.message}`);
  });
}
