// Generated from ../../../../scripts/ops/integrations/model/symphony-session-state.mjs:239

import { createHash } from "node:crypto";
import { logError } from "./logger.mjs";

export function hashMessages(messages) {
  try {
    const json = JSON.stringify(messages);
    const hash = createHash("sha256").update(json).digest("hex");
    return `sha256:${hash}`;
  } catch (err) {
    logError(`[session-state] Failed to hash messages: ${err.message}`);
    return null;
  }
}
