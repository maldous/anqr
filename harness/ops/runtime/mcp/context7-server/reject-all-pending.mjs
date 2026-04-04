import { pendingRequests } from "./pending-requests.mjs";

export function rejectAllPending(reason) {
  for (const [, { reject, timer }] of pendingRequests) {
    clearTimeout(timer);
    reject(new Error(reason));
  }
  pendingRequests.clear();
}
