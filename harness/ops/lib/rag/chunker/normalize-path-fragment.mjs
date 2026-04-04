export function normalizePathFragment(filePath) {
  return String(filePath)
    .replaceAll(/[^a-zA-Z0-9._/-]/g, "_")
    .slice(-120);
}
