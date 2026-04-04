export function coerceStringArrayInput(value, { fallback = undefined } = {}) {
  if (Array.isArray(value)) {
    const cleaned = value
      .filter((item) => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
    return cleaned.length > 0 ? cleaned : fallback;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return fallback;
    if (
      (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
      (trimmed.startsWith('"') && trimmed.endsWith('"'))
    ) {
      try {
        return coerceStringArrayInput(JSON.parse(trimmed), { fallback });
      } catch {
        // Fall through and treat as a literal path string.
      }
    }
    return [trimmed];
  }

  if (value && typeof value === "object") {
    if (typeof value.path === "string") return [value.path.trim()].filter(Boolean);
    if (typeof value.paths === "string" || Array.isArray(value.paths)) {
      return coerceStringArrayInput(value.paths, { fallback });
    }
  }

  return fallback;
}
