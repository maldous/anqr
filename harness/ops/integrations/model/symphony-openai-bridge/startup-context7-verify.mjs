// Extracted from runtime.mjs: non-blocking Context7 HTTP service reachability check.

import { CONTEXT7_HTTP_BASE } from "./context7-http-base.mjs";
import { logInfo, logWarn } from "./logger.mjs";

export function verifyContext7Health() {
  fetch(`${CONTEXT7_HTTP_BASE}/health`, { signal: AbortSignal.timeout(5000) })
    .then(async (res) => ({ status: res.status, data: await res.json().catch(() => ({})) }))
    .then(({ status, data }) => {
      if (status >= 200 && status < 300 && data.status === "ok") {
        logInfo(`✅ Context7 HTTP service reachable (uptime: ${data.uptime}s)`);
        return;
      }
      if (status >= 200 && status < 300) {
        logInfo(
          `ℹ️ Context7 HTTP service reachable but still warming (${data.status || "starting"})`,
        );
        return;
      }
      logInfo(`ℹ️ Context7 HTTP service returned ${status} — cloud-only docs posture active`);
    })
    .catch((err) => {
      logInfo(
        `ℹ️ Context7 HTTP service not running — cloud-only docs posture active (${err?.message || "request failed"})`,
      );
    });
}
