import { REQUEST_TIMEOUT_MS } from "./request-timeout-ms.mjs";

export async function fetchCloud(url, apiKey, init = {}) {
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    ...(init.headers || {}),
  };

  return fetch(url, {
    ...init,
    headers,
    signal: init.signal || AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
}
