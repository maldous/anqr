import { MAX_WINDOW_EVENTS } from "./max-window-events.mjs";
import { REQUEST_WINDOW_MS } from "./request-window-ms.mjs";

export function pruneRequestEvents(state) {
  const cutoff = Date.now() - REQUEST_WINDOW_MS;
  while (state.requestEvents.length > 0 && state.requestEvents[0].ts < cutoff) {
    state.requestEvents.shift();
  }
  if (state.requestEvents.length > MAX_WINDOW_EVENTS) {
    state.requestEvents = state.requestEvents.slice(-MAX_WINDOW_EVENTS);
  }
}
