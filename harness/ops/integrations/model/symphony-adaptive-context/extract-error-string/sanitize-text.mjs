export function sanitizeText(value) {
  return String(value || "")
    .replaceAll(/\s+/g, " ")
    .trim();
}
