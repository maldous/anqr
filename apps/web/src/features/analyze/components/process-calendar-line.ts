import { formatICalDateTime } from "./format-i-cal-date-time";
import { formatRecurrenceRule } from "./format-recurrence-rule";

export function processCalendarLine(
  baseKey: string,
  keyPart: string,
  value: string,
  line: string,
  result: Record<string, string | boolean | null>,
): boolean {
  switch (baseKey) {
    case "SUMMARY":
      result.summary = value;
      return false;
    case "DESCRIPTION":
      result.description = value.replaceAll(String.raw`\n`, "\n").replaceAll(String.raw`\,`, ",");
      return false;
    case "LOCATION":
      result.location = value.replaceAll(String.raw`\,`, ",");
      return false;
    case "DTSTART": {
      result.startDate = value;
      result.startFormatted = formatICalDateTime(value.replaceAll("Z", ""));
      result.isAllDay = value.length === 8;
      const tzMatch = /TZID=([^;:]+)/i.exec(keyPart);
      if (tzMatch) result.timezone = tzMatch[1];
      return false;
    }
    case "DTEND":
      result.endDate = value;
      result.endFormatted = formatICalDateTime(value.replaceAll("Z", ""));
      return false;
    case "DURATION":
      result.duration = value;
      return false;
    case "ORGANIZER": {
      const cnMatch = /CN=([^:;]+)/i.exec(value) ?? /CN=([^:;]+)/i.exec(keyPart);
      result.organizer = cnMatch ? cnMatch[1] : value.replaceAll("mailto:", "");
      return false;
    }
    case "ATTENDEE":
      return true;
    case "RRULE":
      result.recurrence = value;
      result.recurrenceFormatted = formatRecurrenceRule(line);
      return false;
    case "VALARM":
      // VALARM is a component, not a property - skip it
      return false;
    case "TRIGGER":
      // TRIGGER inside VALARM defines the alarm time
      if (value) result.alarm = value;
      return false;
    default:
      return false;
  }
}
