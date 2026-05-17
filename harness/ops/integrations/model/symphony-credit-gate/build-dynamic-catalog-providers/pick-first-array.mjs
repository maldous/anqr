export function pickFirstArray(obj, key, fallback) {
  if (Array.isArray(obj?.[key])) return obj[key];
  if (Array.isArray(fallback?.[key])) return fallback[key];
  return [];
}
