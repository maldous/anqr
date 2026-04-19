// Provider names with tier "local-safety-net".
// Keep in sync with PROVIDERS in ./providers.mjs when adding/removing safety-net entries.

export const LOCAL_SAFETY_NET_PROVIDER_NAMES = new Set([
  // ollama 3b/0.5b removed — below 14B minimum coding capability
  // Re-add when a larger ollama model (e.g. qwen2.5-coder:14b) is available
]);
