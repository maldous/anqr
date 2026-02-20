/**
 * Cloudflare Zaraz Analytics Tracking
 *
 * Safe wrapper around window.zaraz.track() for custom event tracking.
 * Zaraz is injected by Cloudflare's edge network — if the script hasn't
 * loaded (or injection is disabled), calls are silently ignored.
 *
 * Events configured in Zaraz dashboard:
 *   - export: user exports a QR code
 *   - gallery_view: user views the gallery page
 *   - share: user shares/copies a QR code link
 *   - language_switch: user changes the UI language
 */

import { createLogger } from '@/lib/logger';

declare global {
  interface Window {
    zaraz?: {
      track: (eventName: string, properties?: Record<string, string | number | boolean>) => void;
    };
  }
}

const log = createLogger('ZARAZ');

/**
 * Track a custom event via Cloudflare Zaraz.
 * No-op if Zaraz is not loaded (e.g., script not injected yet).
 *
 * @param eventName - Event name matching a Zaraz trigger rule
 * @param properties - Optional key-value properties sent with the event
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, string | number | boolean>
): void {
  try {
    if (typeof window === 'undefined' || !window.zaraz?.track) return;
    window.zaraz.track(eventName, properties);
    log.debug('Event tracked', { eventName, ...properties });
  } catch (err) {
    log.warn('Failed to track event', { event: eventName, error: err });
  }
}
