export function isValidEntry(entry) {
  return (
    entry &&
    typeof entry === "object" &&
    typeof entry.filePath === "string" &&
    typeof entry.content === "string" &&
    Array.isArray(entry.embedding) &&
    Number.isFinite(entry.startLine) &&
    Number.isFinite(entry.endLine) &&
    typeof entry.type === "string"
  );
}
