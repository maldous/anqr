// Generated from ../../../../scripts/ops/integrations/model/symphony-adaptive-context.mjs:117

import { MAX_WINDOW_EVENTS } from "./max-window-events.mjs";
import { TOKEN_WINDOW_MS } from "./token-window-ms.mjs";

export function pruneTokenEvents(state) {
  const cutoff = Date.now() - TOKEN_WINDOW_MS;
  while (state.tokenEvents.length > 0 && state.tokenEvents[0].ts < cutoff) {
    state.tokenEvents.shift();
  }
  if (state.tokenEvents.length > MAX_WINDOW_EVENTS) {
    state.tokenEvents = state.tokenEvents.slice(-MAX_WINDOW_EVENTS);
  }
}
