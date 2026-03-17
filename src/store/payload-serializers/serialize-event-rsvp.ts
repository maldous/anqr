import { generateEvent } from "@/modules/payload-generators";
import type { PayloadData } from "./payload-data";

export function serializeEventRsvp(payload: PayloadData): string {
  const rsvp = payload.eventRsvp;
  if (rsvp.summary || rsvp.start) {
    return generateEvent({
      summary: rsvp.summary,
      location: rsvp.location,
      description: (() => {
        if (rsvp.description && rsvp.rsvpUrl) return `${rsvp.description}\n\nRSVP: ${rsvp.rsvpUrl}`;
        if (rsvp.description) return rsvp.description;
        if (rsvp.rsvpUrl) return `RSVP: ${rsvp.rsvpUrl}`;
        return undefined;
      })(),
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
