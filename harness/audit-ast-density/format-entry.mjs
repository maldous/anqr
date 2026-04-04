export const formatEntry = (entry) => {
  const grouped = entry.nodes.reduce((acc, node) => {
    acc[node.kind] = (acc[node.kind] ?? 0) + 1;
    return acc;
  }, {});

  const summary = Object.entries(grouped)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([kind, count]) => `${kind}:${count}`)
    .join(", ");

  return `${String(entry.count).padStart(3, " ")} ${entry.path}  ${summary}`;
};
