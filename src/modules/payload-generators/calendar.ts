/**
 * Calendar Payload Generators
 * iCalendar event, calendar subscription
 */

import { createLogger } from '../../lib/logger';
import type { EventHelper } from './types';
import { escapeValue, formatICalDate } from './utils';

const _log = createLogger('PAYLOAD');

/** Generate iCalendar VEVENT string per RFC 5545
 * Optimized for QR code size - uses minimal required fields
 */
export function generateEvent(params: EventHelper): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ANQR//EN', // Shortened PRODID to save space
    'BEGIN:VEVENT',
  ];

  // Use a shorter UID format to save bytes
  const uid = `${Date.now().toString(36)}@anqr`;
  // DTSTAMP - use shorter format without full timestamp
  const now = new Date();
  const dtstamp = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, '0')}${String(now.getUTCDate()).padStart(2, '0')}T${String(now.getUTCHours()).padStart(2, '0')}${String(now.getUTCMinutes()).padStart(2, '0')}00Z`;
  lines.push(`UID:${uid}`, `DTSTAMP:${dtstamp}`);

  if (params.start) {
    // Always use UTC with Z suffix for compactness (no TZID needed)
    const startStr = formatICalDate(params.start, true, true);
    lines.push(`DTSTART:${startStr}`);
  }

  if (params.end) {
    const endStr = formatICalDate(params.end, true, true);
    lines.push(`DTEND:${endStr}`);
  }

  // Only include non-empty fields
  if (params.summary?.trim()) {
    // Truncate summary if too long to avoid overflow
    const summary =
      params.summary.length > 50 ? `${params.summary.slice(0, 47)}...` : params.summary;
    lines.push(`SUMMARY:${escapeValue(summary)}`);
  }

  if (params.description?.trim()) {
    // Truncate description if too long
    const desc =
      params.description.length > 100
        ? `${params.description.slice(0, 97)}...`
        : params.description;
    lines.push(`DESCRIPTION:${escapeValue(desc)}`);
  }

  if (params.location?.trim()) {
    // Truncate location if too long
    const loc =
      params.location.length > 50 ? `${params.location.slice(0, 47)}...` : params.location;
    lines.push(`LOCATION:${escapeValue(loc)}`);
  }

  if (params.rrule) {
    lines.push(`RRULE:${params.rrule}`);
  }

  lines.push('END:VEVENT', 'END:VCALENDAR');

  // Use CRLF line endings per RFC 5545
  return lines.join('\r\n');
}

/** Generate calendar subscription URL (webcal://) */
export function generateCalendarSubscription(url: string): string {
  if (url.startsWith('http://')) {
    return url.replace('http://', 'webcal://');
  }
  if (url.startsWith('https://')) {
    return url.replace('https://', 'webcal://');
  }
  return `webcal://${url}`;
}
