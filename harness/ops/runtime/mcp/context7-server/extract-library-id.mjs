function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function scoreCandidate(candidate, preferredText) {
  if (!candidate || !candidate.id) return -1;
  if (!preferredText) return 0;

  const preferred = normalize(preferredText);
  const hint = normalize(candidate.hint || "");
  const id = normalize(candidate.id);

  if (id === preferred || hint === preferred) return 100;
  if (id.endsWith(`/${preferred}`)) return 90;
  if (hint.includes(preferred)) return 80;
  if (id.includes(preferred)) return 70;
  return 0;
}

function pushCandidate(candidates, id, hint = "") {
  const value = String(id || "").trim();
  if (!value.startsWith("/")) return;
  candidates.push({ id: value, hint: String(hint || "").trim() });
}

function extractIdsFromString(text, candidates) {
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

  try {
    inspectValue(JSON.parse(value), candidates);
  } catch {
    // ignore non-JSON payloads
  }
}

function inspectValue(value, candidates) {
  if (!value) return;

  if (typeof value === "string") {
    extractIdsFromString(value, candidates);
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
      pushCandidate(
        candidates,
        value.context7CompatibleLibraryID,
        value.title || value.name || "",
      );
    }
    if (typeof value.id === "string" && value.id.startsWith("/")) {
      pushCandidate(candidates, value.id, value.title || value.name || "");
    }

    for (const nested of Object.values(value)) {
      inspectValue(nested, candidates);
    }
  }
}

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
