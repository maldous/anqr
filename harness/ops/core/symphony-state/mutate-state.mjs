import { loadState } from "./load-state.mjs";
import { saveState } from "./save-state.mjs";
import { withStateLock } from "./with-state-lock.mjs";

export function mutateState(mutator) {
  return withStateLock(() => {
    let store;
    try {
      store = loadState();
    } catch (err) {
      // Transient read error — skip mutation entirely rather than wipe state.
      process.stderr.write(`[mutate-state] Skipping mutation due to read error: ${err.message}\n`);
      return null;
    }
    const result = mutator(store) || store;
    saveState(result);
    return result;
  });
}
