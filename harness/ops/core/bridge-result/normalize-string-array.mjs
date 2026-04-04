export function normalizeStringArray(value, fallback = []) {
  if (!Array.isArray(value)) return [...fallback];
  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}
