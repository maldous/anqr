import { plannedThisSession } from "./planned-session.mjs";

export function issueAlreadyPlanned(issue) {
  return plannedThisSession.has(issue.identifier);
}
