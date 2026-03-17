import { zarazLog as log } from "./zaraz-log";

export function trackZarazEvent(
  eventName: string,
  properties?: Record<string, string | number | boolean>,
): void {
  try {
    if (typeof globalThis.window === "undefined" || !globalThis.window.zaraz?.track) return;
    globalThis.window.zaraz.track(eventName, properties);
    log.debug("Event tracked", { eventName, ...properties });
  } catch (err) {
    log.warn("Failed to track event", { event: eventName, error: err });
  }
}
