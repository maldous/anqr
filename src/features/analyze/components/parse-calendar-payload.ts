import { forEachFoldedLine } from './for-each-folded-line';
import { processCalendarLine } from './process-calendar-line';

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

  let attendeesCount = 0;
  forEachFoldedLine(payload, (baseKey, keyPart, value, line) => {
    if (processCalendarLine(baseKey, keyPart, value, line, result)) {
      attendeesCount++;
    }
  });

  result.attendeesCount = attendeesCount > 0 ? String(attendeesCount) : null;

  return result;
}
