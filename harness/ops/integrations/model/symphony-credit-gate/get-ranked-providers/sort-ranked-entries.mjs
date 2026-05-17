export function sortRankedEntries(a, b) {
  const scoreA = typeof a.score === "number" ? a.score : Number.NEGATIVE_INFINITY;
  const scoreB = typeof b.score === "number" ? b.score : Number.NEGATIVE_INFINITY;
  return (
    scoreB - scoreA ||
    Number(b.toolConfirmed) - Number(a.toolConfirmed) ||
    (b.selections || 0) - (a.selections || 0) ||
    a.name.localeCompare(b.name)
  );
}
