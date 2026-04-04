// Generated from ../../../../scripts/ops/integrations/linear/review-open-issues.mjs:37

export function extractSonarDupKey(issue) {
  const match = issue.description?.match(/<!-- sonar-dup-key:([a-f0-9-]+) -->/);
  return match ? match[1] : null;
}
