import { generateEvent } from "@/modules/payload-generators";
import type { PayloadData } from "./payload-data";

export function serializeEventRsvp(payload: PayloadData): string {
  const rsvp = payload.eventRsvp;
  if (rsvp.summary || rsvp.start) {
    return generateEvent({
      summary: rsvp.summary,
      location: rsvp.location,
      description: rsvp.description
        ? rsvp.rsvpUrl
          ? `${rsvp.description}\n\nRSVP: ${rsvp.rsvpUrl}`
          : rsvp.description
        : rsvp.rsvpUrl
          ? `RSVP: ${rsvp.rsvpUrl}`
          : undefined,
      start: rsvp.start,
      end: rsvp.end,
    });
  }
  const url = rsvp.rsvpUrl || payload.text;
  if (url.includes("@") && !url.startsWith("mailto:") && !url.startsWith("http")) {
    return `mailto:${url}?subject=RSVP`;
  }
  return url;
}
