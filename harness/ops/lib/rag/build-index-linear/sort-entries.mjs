export function sortEntries(entries) {
  return [...entries].sort((a, b) => {
    return (
      String(a.filePath || "").localeCompare(String(b.filePath || "")) ||
      String(a.id || "").localeCompare(String(b.id || ""))
    );
  });
}
