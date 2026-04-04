// Generated from ../../../../scripts/ops/lib/search/linear-search.mjs:47

export function extractTitle(content) {
  const match = content.match(/^#\s+([A-Z]+-\d+):\s+(.+)$/m);
  return match ? match[2] : "(no title)";
}
