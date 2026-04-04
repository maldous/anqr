export const choosePrimaryEntry = (entries) => {
  const named = entries.filter((entry) => entry.name && !entry.name.startsWith("_"));
  const exportedNamed = named.filter((entry) => entry.exported);
  const preferred = exportedNamed.length > 0 ? exportedNamed : named;
  return preferred.length === 1 ? preferred[0] : null;
};
