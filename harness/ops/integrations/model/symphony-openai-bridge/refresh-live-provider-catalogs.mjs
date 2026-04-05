import { normalizeOpenrouterCatalog } from "./normalize-openrouter-catalog.mjs";
import { saveProviderCatalogCache } from "./save-provider-catalog-cache.mjs";

export async function refreshLiveProviderCatalogs() {
  const token = process.env.OPENROUTER_TOKEN;
  if (!token) return null;
  const response = await fetch("https://openrouter.ai/api/v1/models", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(`openrouter catalog refresh failed: ${response.status}`);
  }
  const payload = await response.json();
  const models = normalizeOpenrouterCatalog(payload);
  const cache = {
    updatedAt: new Date().toISOString(),
    openrouter: {
      models,
      count: models.length,
    },
  };
  await saveProviderCatalogCache(cache);
  return cache;
}
