export function compactWhitespace(value) {
  return String(value || "")
    .replaceAll(/\r\n/g, "\n")
    .replaceAll(/\n{3,}/g, "\n\n")
    .trim();
}
