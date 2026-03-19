import type { ZarazWindow } from "./zaraz-window";
import { zarazLog as log } from "./zaraz-log";

export function trackZarazEvent(
  eventName: string,
  properties?: Record<string, string | number | boolean>,
): void {
  try {
    const windowWithZaraz = globalThis.window as Window & Partial<ZarazWindow>;
    if (!windowWithZaraz?.zaraz?.track) return;
    windowWithZaraz.zaraz.track(eventName, properties);
    log.debug("Event tracked", { eventName, ...properties });
  } catch (err) {
    log.warn("Failed to track event", { event: eventName, error: err });
  }
}
