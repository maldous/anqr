import { pushCandidate } from "./push-candidate.mjs";

export function extractIdsFromString(text, candidates) {
  const value = String(text || "").trim();
  if (!value) return;

  const plainMatchPatterns = [
    /Context7-compatible library ID:\s*(\/[^\s"'`,]+)/gi,
    /library ID:\s*(\/[^\s"'`,]+)/gi,
    /context7CompatibleLibraryID["'\s:]+(\/[^\s"',}]+)/gi,
    /libraryId["'\s:]+(\/[^\s"',}]+)/gi,
    /(\/[A-Za-z0-9._-]+\/[A-Za-z0-9._@/-]+)/g,
  ];

  for (const pattern of plainMatchPatterns) {
    for (const match of value.matchAll(pattern)) {
      if (match?.[1]) pushCandidate(candidates, match[1], value);
      if (match?.[0]?.startsWith("/")) pushCandidate(candidates, match[0], value);
    }
  }
}
