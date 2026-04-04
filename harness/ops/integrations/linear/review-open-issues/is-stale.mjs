import { STALE_DAYS } from "./stale-days.mjs";

export function isStale(issue) {
  const createdAt = new Date(issue.createdAt);
  const ageInDays = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  return ageInDays > STALE_DAYS;
}
