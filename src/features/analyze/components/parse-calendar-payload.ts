import { processCalendarLine } from './payload-parsers._internal';

export function parseCalendarPayload(payload: string): Record<string, string | boolean | null> {
  const result: Record<string, string | boolean | null> = {
    summary: null,
    description: null,
    location: null,
    startDate: null,
    startFormatted: null,
    endDate: null,
    endFormatted: null,
    duration: null,
    organizer: null,
    attendeesCount: null,
    recurrence: null,
    recurrenceFormatted: null,
    isAllDay: false,
    timezone: null,
    alarm: null,
  };

  if (
    !(
      payload.toUpperCase().includes('BEGIN:VCALENDAR') ||
      payload.toUpperCase().includes('BEGIN:VEVENT')
    )
  ) {
    return result;
  }

  const lines = payload.split(/\r?\n/);
  let attendeesCount = 0;

  let i = 0;
  while (i < lines.length) {
    let line = lines[i];
    while (i + 1 < lines.length && /^[ \t]/.test(lines[i + 1])) {
      i++;
      line += lines[i].slice(1);
    }
    i++;

    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;

    const keyPart = line.slice(0, colonIdx).toUpperCase();
    const value = line.slice(colonIdx + 1);
    const baseKey = keyPart.split(';')[0];

    if (processCalendarLine(baseKey, keyPart, value, line, result)) {
      attendeesCount++;
    }
  }

  result.attendeesCount = attendeesCount > 0 ? String(attendeesCount) : null;

  return result;
}
