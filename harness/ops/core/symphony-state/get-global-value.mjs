import { loadState } from "./load-state.mjs";

export function getGlobalValue(key, fallback = null) {
  const store = loadState();
  return Object.hasOwn(store.global || {}, key) ? store.global[key] : fallback;
}
