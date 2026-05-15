import { loadStateOrEmpty } from "./load-state-or-empty.mjs";
import { saveState } from "./save-state.mjs";
import { withStateLock } from "./with-state-lock.mjs";

export function mutateState(mutator) {
  return withStateLock(() => {
    const store = loadStateOrEmpty();
    const result = mutator(store) || store;
    saveState(result);
    return result;
  });
}
