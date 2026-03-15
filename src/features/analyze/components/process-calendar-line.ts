import { formatICalDateTime } from './format-i-cal-date-time';
import { formatRecurrenceRule } from './format-recurrence-rule';

export function processCalendarLine(
  baseKey: string,
  keyPart: string,
  value: string,
  line: string,
  result: Record<string, string | boolean | null>
): boolean {
  switch (baseKey) {
    case 'SUMMARY':
      result.summary = value;
      return false;
    case 'DESCRIPTION':
      result.description = value.replaceAll('\\n', '\n').replaceAll('\\,', ',');
      return false;
    case 'LOCATION':
      result.location = value.replaceAll('\\,', ',');
      return false;
    case 'DTSTART': {
      result.startDate = value;
      result.startFormatted = formatICalDateTime(value.replaceAll('Z', ''));
      result.isAllDay = value.length === 8;
      const tzMatch = keyPart.match(/TZID=([^;:]+)/i);
      if (tzMatch) result.timezone = tzMatch[1];
      return false;
    }
    case 'DTEND':
      result.endDate = value;
      result.endFormatted = formatICalDateTime(value.replaceAll('Z', ''));
      return false;
    case 'DURATION':
      result.duration = value;
      return false;
    case 'ORGANIZER': {
      const cnMatch = value.match(/CN=([^:;]+)/i) || keyPart.match(/CN=([^:;]+)/i);
      result.organizer = cnMatch ? cnMatch[1] : value.replaceAll('mailto:', '');
      return false;
    }
    case 'ATTENDEE':
      return true;
    case 'RRULE':
      result.recurrence = value;
      result.recurrenceFormatted = formatRecurrenceRule(line);
      return false;
    case 'VALARM':
    case 'TRIGGER':
      if (value) result.alarm = value;
      return false;
    default:
      return false;
  }
}
