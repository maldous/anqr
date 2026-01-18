/**
 * Calendar Payload Generators
 * iCalendar event, calendar subscription
 */

import type { EventHelper } from './types';
import { escapeValue, formatICalDate } from './utils';

/** Generate iCalendar VEVENT string */
export function generateEvent(params: EventHelper): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ANQR//QR Code Generator//EN',
    'BEGIN:VEVENT',
  ];

  const uid = `${Date.now()}-${crypto.randomUUID().slice(0, 9)}@anqr`;
  lines.push(`UID:${uid}`, `DTSTAMP:${formatICalDate(new Date().toISOString())}`);

  if (params.start) {
    const startStr = formatICalDate(params.start);
    if (params.tz) {
      lines.push(`DTSTART;TZID=${params.tz}:${startStr}`);
    } else {
      lines.push(`DTSTART:${startStr}`);
    }
  }

  if (params.end) {
    const endStr = formatICalDate(params.end);
    if (params.tz) {
      lines.push(`DTEND;TZID=${params.tz}:${endStr}`);
    } else {
      lines.push(`DTEND:${endStr}`);
    }
  }

  if (params.summary) {
    lines.push(`SUMMARY:${escapeValue(params.summary)}`);
  }

  if (params.description) {
    lines.push(`DESCRIPTION:${escapeValue(params.description)}`);
  }

  if (params.location) {
    lines.push(`LOCATION:${escapeValue(params.location)}`);
  }

  if (params.rrule) {
    lines.push(`RRULE:${params.rrule}`);
  }

  lines.push('END:VEVENT', 'END:VCALENDAR');

  return lines.join('\n');
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
