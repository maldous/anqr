export function trimString(value, limit = 240) {
  const text = String(value || "");
  return text.length > limit ? `${text.slice(0, limit)}…` : text;
}
