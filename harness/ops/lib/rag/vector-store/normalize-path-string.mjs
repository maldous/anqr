export function normalizePathString(value) {
  return String(value || "").replaceAll(/\\/g, "/");
}
