import { loadState } from "./load-state.mjs";
import { saveState } from "./save-state.mjs";
import { withStateLock } from "./with-state-lock.mjs";

export function dequeueIntegrationCandidate(issueIdentifier) {
  return withStateLock(() => {
    const store = loadState();
    if (!Array.isArray(store.global.integrationQueue)) store.global.integrationQueue = [];
    store.global.integrationQueue = store.global.integrationQueue.filter(
      (id) => id !== issueIdentifier,
    );
    saveState(store);
    return store.global.integrationQueue;
  });
}
