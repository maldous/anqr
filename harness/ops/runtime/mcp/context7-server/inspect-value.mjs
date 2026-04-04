import { extractIdsFromString } from "./extract-ids-from-string.mjs";
import { pushCandidate } from "./push-candidate.mjs";

export function inspectValue(value, candidates) {
  if (!value) return;

  if (typeof value === "string") {
    extractIdsFromString(value, candidates);
    try {
      const parsed = JSON.parse(value.trim());
      if (parsed && typeof parsed === "object") {
        inspectValue(parsed, candidates);
      }
    } catch {
      // ignore non-JSON payloads
    }
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      inspectValue(item, candidates);
    }
    return;
  }

  if (typeof value === "object") {
    if (typeof value.libraryId === "string") {
      pushCandidate(candidates, value.libraryId, value.title || value.name || "");
    }
    if (typeof value.context7CompatibleLibraryID === "string") {
      pushCandidate(candidates, value.context7CompatibleLibraryID, value.title || value.name || "");
    }
    if (typeof value.id === "string" && value.id.startsWith("/")) {
      pushCandidate(candidates, value.id, value.title || value.name || "");
    }

    for (const nested of Object.values(value)) {
      inspectValue(nested, candidates);
    }
  }
}
