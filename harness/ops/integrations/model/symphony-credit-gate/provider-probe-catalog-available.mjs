export function providerProbeCatalogAvailable(provider, bodyText) {
  const needle = String(provider?.model || "").toLowerCase();
  const haystack = String(bodyText || "").toLowerCase();
  return needle.length > 0 && haystack.includes(needle);
}
