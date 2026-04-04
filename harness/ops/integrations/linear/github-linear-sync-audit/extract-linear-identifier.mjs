// Generated from ../../../../scripts/ops/integrations/linear/github-linear-sync-audit.mjs:109

export function extractLinearIdentifier(issue) {
  // Look for Linear identifier patterns in the issue body or title
  // Common patterns: ANQR-123, [ANQR-123], Linear: ANQR-123, etc.
  const text = `${issue.title} ${issue.body || ""}`;
  const patterns = [
    /\b([A-Z]{2,}-\d+)\b/g, // ANQR-123
    /Linear[:\s]+([A-Z]{2,}-\d+)/gi, // Linear: ANQR-123
    /\[([A-Z]{2,}-\d+)\]/g, // [ANQR-123]
  ];

  const matches = new Set();
  for (const pattern of patterns) {
    const found = text.matchAll(pattern);
    for (const match of found) {
      matches.add(match[1].toUpperCase());
    }
  }

  return Array.from(matches);
}
