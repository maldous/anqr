import { ICAL_DAY_NAMES } from './ical-day-names';
import { formatIntervalUnit } from './format-interval-unit';

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
