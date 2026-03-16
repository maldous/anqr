import { trackZarazEvent } from "./track-zaraz-event";
export function trackEvent(
  eventName: string,
  properties?: Record<string, string | number | boolean>,
): void {
  trackZarazEvent(eventName, properties);
}
