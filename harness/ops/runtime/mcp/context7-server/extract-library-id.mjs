import { inspectValue } from "./inspect-value.mjs";
import { scoreCandidate } from "./score-candidate.mjs";

export function extractLibraryId(result, options = {}) {
  if (!result) return null;

  const candidates = [];
  inspectValue(result, candidates);

  if (candidates.length === 0) {
    return null;
  }

  const preferredText = options.preferredText || "";
  candidates.sort((a, b) => scoreCandidate(b, preferredText) - scoreCandidate(a, preferredText));

  return candidates[0]?.id || null;
}
