// Generated from ../../../../scripts/ops/integrations/linear/issue-hygiene.mjs:31

export const FAILURE_PATTERNS = {
  stillFailing: /\*\*Still failing\*\*/i,
  stale: /⏰.*Stale execution/i,
  harnessFail: /Harness.*failure/i,
  guardian: /Auto-created by linear-guardian/i,
};
