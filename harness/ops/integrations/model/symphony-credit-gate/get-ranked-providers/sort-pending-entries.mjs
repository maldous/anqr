export function sortPendingEntries(a, b) {
  return (
    Number(b.toolConfirmed) - Number(a.toolConfirmed) ||
    (b.selections || 0) - (a.selections || 0) ||
    a.name.localeCompare(b.name)
  );
}
