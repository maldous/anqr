export function sortCatalogRows(a, b) {
  const aSupport = a?.toolSupport === "supported" ? 1 : 0;
  const bSupport = b?.toolSupport === "supported" ? 1 : 0;
  const aContext = Number(a?.contextLength || 0);
  const bContext = Number(b?.contextLength || 0);
  return (
    bSupport - aSupport ||
    bContext - aContext ||
    String(a?.model || "").localeCompare(String(b?.model || ""))
  );
}
