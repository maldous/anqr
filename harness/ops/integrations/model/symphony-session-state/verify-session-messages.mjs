// Generated from ../../../../scripts/ops/integrations/model/symphony-session-state.mjs:303

import { hashMessages } from "./hash-messages.mjs";
import { loadSessionState } from "./load-session-state.mjs";
import { logWarn } from "./logger.mjs";

export function verifySessionMessages(sessionId, providedMessages) {
  if (!sessionId) return false;

  const state = loadSessionState();
  const session = state[sessionId];
  if (!session || !session.messageHash) {
    return false;
  }

  const providedHash = hashMessages(providedMessages);
  if (!providedHash) return false;

  const matches = session.messageHash === providedHash;
  if (!matches) {
    logWarn(
      `[session-state] Message hash mismatch for session ${sessionId.slice(0, 8)}... - stored=${session.messageHash}, provided=${providedHash}`,
    );
  }
  return matches;
}
