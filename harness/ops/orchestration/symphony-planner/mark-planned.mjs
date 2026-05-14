import { plannedThisSession } from "./planned-session.mjs";

export function markPlanned(identifier) {
  plannedThisSession.add(identifier);
}
