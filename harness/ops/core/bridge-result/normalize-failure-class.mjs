export function normalizeFailureClass(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}
