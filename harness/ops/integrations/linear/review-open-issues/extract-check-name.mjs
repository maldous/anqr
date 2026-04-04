// Generated from ../../../../scripts/ops/integrations/linear/review-open-issues.mjs:43

export function extractCheckName(issue) {
  const match = issue.description?.match(/\*\*Check:\*\* `([^`]+)`/);
  return match ? match[1] : null;
}
