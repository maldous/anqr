import { formatIntervalUnit } from "./format-interval-unit";
import { formatWeeklyText } from "./format-weekly-text";

export function formatFrequencyText(freq: string, interval: number, byday?: string): string {
  switch (freq) {
    case "DAILY":
      return formatIntervalUnit("Daily", "days", interval);
    case "WEEKLY":
      return formatWeeklyText(interval, byday);
    case "MONTHLY":
      return formatIntervalUnit("Monthly", "months", interval);
    case "YEARLY":
      return formatIntervalUnit("Yearly", "years", interval);
    default:
      return freq || "Recurring";
  }
}
