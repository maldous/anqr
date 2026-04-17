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
      logWarn(`⚠️ Context7 HTTP service returned ${status} — local docs degraded, falling back to cloud`);
    })
    .catch((err) => {
      logWarn(
        `⚠️ Context7 HTTP service not reachable at ${CONTEXT7_HTTP_BASE} — local docs unavailable (${err?.message || "request failed"})`,
      );
    });
}
