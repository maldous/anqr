// Extracted from runtime.mjs: non-blocking Context7 HTTP service reachability check.

import { CONTEXT7_HTTP_BASE } from "./context7-http-base.mjs";
import { logInfo, logWarn } from "./logger.mjs";

export function verifyContext7Health() {
  fetch(`${CONTEXT7_HTTP_BASE}/health`, { signal: AbortSignal.timeout(5000) })
    .then((res) => res.json())
    .then((data) => {
      if (data.serverReady) {
        logInfo(`✅ Context7 HTTP service reachable (uptime: ${data.uptime}s)`);
      } else {
        logWarn(`⚠️ Context7 HTTP service degraded — will use cloud API fallback`);
      }
    })
    .catch(() => {
      logWarn(
        `⚠️ Context7 HTTP service not reachable at ${CONTEXT7_HTTP_BASE} — will use cloud API fallback`,
      );
    });
}
