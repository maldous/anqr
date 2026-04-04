import { loadState } from "./load-state.mjs";
import { saveState } from "./save-state.mjs";
import { withStateLock } from "./with-state-lock.mjs";

export function mutateState(mutator) {
  return withStateLock(() => {
    const store = loadState();
    const result = mutator(store) || store;
    saveState(result);
    return result;
  });
}
