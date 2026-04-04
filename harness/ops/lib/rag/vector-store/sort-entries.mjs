export function sortEntries(entries) {
  return [...(entries || [])].sort((a, b) => {
    return (
      String(a.filePath || "").localeCompare(String(b.filePath || "")) ||
      Number(a.startLine || 0) - Number(b.startLine || 0) ||
      Number(a.endLine || 0) - Number(b.endLine || 0) ||
      String(a.type || "").localeCompare(String(b.type || "")) ||
      String(a.id || "").localeCompare(String(b.id || ""))
    );
  });
}
