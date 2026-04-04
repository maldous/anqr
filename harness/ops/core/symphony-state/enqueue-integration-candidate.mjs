import { loadState } from "./load-state.mjs";
import { saveState } from "./save-state.mjs";
import { withStateLock } from "./with-state-lock.mjs";

export function enqueueIntegrationCandidate(issueIdentifier) {
  return withStateLock(() => {
    const store = loadState();
    if (!Array.isArray(store.global.integrationQueue)) store.global.integrationQueue = [];
    if (!store.global.integrationQueue.includes(issueIdentifier)) {
      store.global.integrationQueue.push(issueIdentifier);
    }
    saveState(store);
    return store.global.integrationQueue;
  });
}
