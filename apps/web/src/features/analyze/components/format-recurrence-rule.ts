import { formatICalDateTime } from "./format-i-cal-date-time";
import { formatFrequencyText } from "./format-frequency-text";

export function formatRecurrenceRule(rrule: string): string {
  const parts: Record<string, string> = {};
  for (const p of rrule.replaceAll("RRULE:", "").split(";")) {
    const [k, v] = p.split("=");
    if (k && v) parts[k] = v;
  }

  const interval = parts.INTERVAL ? Number.parseInt(parts.INTERVAL, 10) : 1;
  let text = formatFrequencyText(parts.FREQ, interval, parts.BYDAY);

  if (parts.UNTIL) text += ` until ${formatICalDateTime(parts.UNTIL)}`;
  if (parts.COUNT) text += ` (${parts.COUNT} times)`;

  return text;
}
