import { isIndexReady } from "./is-index-ready.mjs";

export function vectorStoreReady() {
  try {
    return typeof isIndexReady === "function" && isIndexReady();
  } catch {
    return false;
  }
}
