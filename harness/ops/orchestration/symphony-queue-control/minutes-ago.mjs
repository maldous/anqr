import { issueAge } from "./issue-age.mjs";

export function minutesAgo(issue, field) {
  return Math.floor(issueAge(issue, field) / 60_000);
}
