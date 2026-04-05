export function providerProbeCatalogMatchedNeedle(provider) {
  return String(provider?.model || "").toLowerCase();
}
