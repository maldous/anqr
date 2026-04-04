export const groupByFile = (items) => {
  const map = new Map();

  for (const item of items) {
    if (!map.has(item.path)) {
      map.set(item.path, []);
    }
    map.get(item.path).push(item);
  }

  return [...map.entries()]
    .map(([filePath, entries]) => ({
      path: filePath,
      entries: entries.sort((a, b) => a.line - b.line || a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.path.localeCompare(b.path));
};
