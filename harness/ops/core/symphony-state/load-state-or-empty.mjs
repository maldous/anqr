import { emptyStore } from "./empty-store.mjs";
import { loadState } from "./load-state.mjs";

/** Load state, returning emptyStore only on ENOENT (first-run bootstrap). */
export function loadStateOrEmpty() {
  try {
    return loadState();
  } catch (err) {
    if (err.code === "ENOENT") return emptyStore();
    throw err;
  }
}
