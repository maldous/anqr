import type { PayloadData } from "./payload-data";

export function serializeCalendarSubscription(payload: PayloadData): string {
  const calSub = payload.calendarSub;
  let url = calSub.url || payload.text;
  if (url.startsWith("https://")) {
    url = url.replace("https://", "webcal://");
  } else if (url.startsWith("http://")) {
    url = url.replace("http://", "webcal://");
  } else if (url && !url.startsWith("webcal://")) {
    url = `webcal://${url}`;
  }
  if (calSub.calendarName && url) {
    url += url.includes("?") ? "&" : "?";
    url += `name=${encodeURIComponent(calSub.calendarName)}`;
  }
  return url;
}
