// Generated from ../../../../scripts/ops/integrations/model/discord-request-router.mjs:54

import { SESSION_TTL_MS } from "./session-ttl-ms.mjs";
import { sessionThreadNames } from "./session-thread-names.mjs";

export function evictExpiredSessions() {
  const now = Date.now();
  for (const [key, entry] of sessionThreadNames) {
    if (now - entry.createdAt > SESSION_TTL_MS) {
      sessionThreadNames.delete(key);
    }
  }
}
