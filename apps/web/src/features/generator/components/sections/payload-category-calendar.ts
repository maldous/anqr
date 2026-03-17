import { payloadCategory } from "./payload-category";

export const payloadCategoryCalendar = payloadCategory("payload.calendar", "advanced", [
  ["event", "payload.event"],
  ["event_rsvp", "payload.eventRsvp"],
  ["calendar_subscription", "payload.calendarSubscription"],
]);
