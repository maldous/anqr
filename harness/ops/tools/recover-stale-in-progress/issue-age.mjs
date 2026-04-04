// Generated from ../../../scripts/ops/tools/recover-stale-in-progress.mjs:30

export function issueAge(issue, field) {
  return Date.now() - new Date(issue[field]).getTime();
}
