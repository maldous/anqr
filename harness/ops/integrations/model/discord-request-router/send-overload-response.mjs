import { MAX_CONCURRENT } from "./max-concurrent.mjs";
import { globalActiveRequests } from "./global-active-requests.mjs";
import { logWarn } from "./logger.mjs";

export function sendOverloadResponse(res) {
  const overloadMessage = {
    content: "⚠️ **System Overload** — Too many concurrent requests. Please try again in a moment.",
  };

  res.writeHead(429, {
    "Content-Type": "application/json",
    "X-RateLimit-Remaining": "0",
    "Retry-After": "30",
  });
  res.end(JSON.stringify(overloadMessage));

  logWarn(`🚫 Overload: rejected request (${globalActiveRequests}/${MAX_CONCURRENT} active)`);
}
