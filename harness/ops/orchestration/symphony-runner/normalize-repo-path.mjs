export function normalizeRepoPath(value) {
  return String(value || "")
    .replaceAll(/\\/g, "/")
    .trim();
}
