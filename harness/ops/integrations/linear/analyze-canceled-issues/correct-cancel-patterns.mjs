// Generated from ../../../../scripts/ops/integrations/linear/analyze-canceled-issues.mjs:26

export const CORRECT_CANCEL_PATTERNS = {
  NOT_IN_SCOPE: /CANCELED: NOT IN 1\.0 CLAIM/i,
  SUPERSEDED: /CANCELED: Superseded/i,
  HUMAN_ONLY: /CANCELED:.*human-only/i,
  EXPLICIT_CANCEL: /CANCELED:/i,
};
