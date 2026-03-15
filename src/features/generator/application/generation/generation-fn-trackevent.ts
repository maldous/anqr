/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Schedule telemetry event via idle callback.
 */

import { trackEvent } from '@/infra/telemetry/zaraz';

export function scheduleTrackEvent(
  eventName: string,
  payload?: Record<string, string | number | boolean>
): void {
  const run = () => {
    trackEvent(eventName, payload);
  };
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(() => run(), { timeout: 1200 });
    return;
  }
  setTimeout(run, 0);
}
