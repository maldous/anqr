import { providerProbeFetchWithTimeout } from "../provider-probe-fetch-with-timeout.mjs";
import { FETCH_TIMEOUT_MS } from "./constants.mjs";

export async function fetchModelsFromApi(provider, apiKey) {
  const url = provider.modelsUrl || (provider.baseUrl ? `${provider.baseUrl}/models` : null);
  if (!url) return null;

  const headers = provider.envVar ? { Authorization: `Bearer ${apiKey}` } : {};
  try {
    const response = await providerProbeFetchWithTimeout(url, FETCH_TIMEOUT_MS, { headers });
    if (!response.ok) return null;
    const body = await response.json();
    return body;
  } catch {
    return null;
  }
}
