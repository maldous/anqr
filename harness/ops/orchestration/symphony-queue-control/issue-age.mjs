// Generated from ../../../scripts/ops/orchestration/symphony-queue-control.mjs:45

export function issueAge(issue, field) {
  return Date.now() - new Date(issue[field]).getTime();
}
