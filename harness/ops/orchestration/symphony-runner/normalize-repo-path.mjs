export function normalizeRepoPath(value) {
  return String(value || "")
    .replace(/\\/g, "/")
    .trim();
}
