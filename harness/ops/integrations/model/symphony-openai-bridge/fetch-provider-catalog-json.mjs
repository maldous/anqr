export async function fetchProviderCatalogJson(definition) {
  const response = await fetch(definition.url, { headers: definition.headers });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${definition.cacheKey} catalog refresh failed: ${response.status} ${text}`);
  }
  return JSON.parse(text);
}
