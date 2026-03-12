// ---------------------------------------------------------------------------
// 2. vCard parser – parses BEGIN:VCARD...END:VCARD
// ---------------------------------------------------------------------------
function extractTypePrefix(keyPart: string, fallback: string): string {
  const typeMatch = keyPart.match(/TYPE=([^;:]+)/i);
  return typeMatch ? typeMatch[1] : fallback;
}

export function processVCardLine(
  baseKey: string,
  keyPart: string,
  value: string,
  result: Record<string, string | string[] | null>,
  phones: string[],
  emails: string[],
  addresses: string[]
): void {
  switch (baseKey) {
    case 'VERSION':
      result.version = value;
      break;
    case 'FN':
      result.fullName = value;
      break;
    case 'N':
      result.name = value.replaceAll(';', ' ').trim();
      break;
    case 'ORG':
      result.organization = value.replaceAll(';', ', ');
      break;
    case 'TITLE':
      result.title = value;
      break;
    case 'TEL':
      phones.push(`${extractTypePrefix(keyPart, 'Phone')}: ${value}`);
      break;
    case 'EMAIL':
      emails.push(`${extractTypePrefix(keyPart, 'Email')}: ${value}`);
      break;
    case 'ADR': {
      const addrParts = value.split(';').filter(Boolean);
      if (addrParts.length > 0) {
        addresses.push(`${extractTypePrefix(keyPart, 'Address')}: ${addrParts.join(', ')}`);
      }
      break;
    }
    case 'BDAY':
      result.birthday = value;
      break;
    case 'URL':
      result.url = value;
      break;
    case 'NOTE':
      result.note = value;
      break;
    case 'PHOTO':
      result.hasPhoto = 'true';
      break;
  }
}

// ---------------------------------------------------------------------------
// 11. Calendar event parser
// ---------------------------------------------------------------------------
function formatICalDateTime(dt: string): string {
  try {
    const isAllDay = dt.length === 8;
    const year = Number.parseInt(dt.slice(0, 4), 10);
    const month = Number.parseInt(dt.slice(4, 6), 10) - 1;
    const day = Number.parseInt(dt.slice(6, 8), 10);
    let hours = 0,
      minutes = 0;

    if (!isAllDay && dt.includes('T')) {
      const timePart = dt.split('T')[1];
      hours = Number.parseInt(timePart.slice(0, 2), 10);
      minutes = Number.parseInt(timePart.slice(2, 4), 10);
    }

    const date = new Date(year, month, day, hours, minutes);

    if (isAllDay) {
      return date.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
    return date.toLocaleString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return dt;
  }
}

export const ICAL_DAY_NAMES: Record<string, string> = {
  SU: 'Sunday',
  MO: 'Monday',
  TU: 'Tuesday',
  WE: 'Wednesday',
  TH: 'Thursday',
  FR: 'Friday',
  SA: 'Saturday',
};

export function formatIntervalUnit(singular: string, plural: string, interval: number): string {
  return interval === 1 ? singular : `Every ${interval} ${plural}`;
}

export function formatWeeklyText(interval: number, byday?: string): string {
  if (byday) {
    const days = byday
      .split(',')
      .map((d) => ICAL_DAY_NAMES[d] || d)
      .join(', ');
    return interval === 1 ? `Weekly on ${days}` : `Every ${interval} weeks on ${days}`;
  }
  return formatIntervalUnit('Weekly', 'weeks', interval);
}

export function formatFrequencyText(freq: string, interval: number, byday?: string): string {
  switch (freq) {
    case 'DAILY':
      return formatIntervalUnit('Daily', 'days', interval);
    case 'WEEKLY':
      return formatWeeklyText(interval, byday);
    case 'MONTHLY':
      return formatIntervalUnit('Monthly', 'months', interval);
    case 'YEARLY':
      return formatIntervalUnit('Yearly', 'years', interval);
    default:
      return freq || 'Recurring';
  }
}

export function formatRecurrenceRule(rrule: string): string {
  const parts: Record<string, string> = {};
  rrule
    .replaceAll('RRULE:', '')
    .split(';')
    .forEach((p) => {
      const [k, v] = p.split('=');
      if (k && v) parts[k] = v;
    });

  const interval = parts.INTERVAL ? Number.parseInt(parts.INTERVAL, 10) : 1;
  let text = formatFrequencyText(parts.FREQ, interval, parts.BYDAY);

  if (parts.UNTIL) text += ` until ${formatICalDateTime(parts.UNTIL)}`;
  if (parts.COUNT) text += ` (${parts.COUNT} times)`;

  return text;
}

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

export { extractTypePrefix, formatICalDateTime };
