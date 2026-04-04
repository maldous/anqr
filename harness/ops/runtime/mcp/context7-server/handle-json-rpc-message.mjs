import { pendingRequests } from "./pending-requests.mjs";
import { logDebug } from "./logger.mjs";

export function handleJsonRpcMessage(message) {
  // Response to a request we sent
  if (message.id !== undefined && pendingRequests.has(message.id)) {
    const { resolve, reject, timer } = pendingRequests.get(message.id);
    pendingRequests.delete(message.id);
    clearTimeout(timer);

    if (message.error) {
      reject(new Error(message.error.message || JSON.stringify(message.error)));
    } else {
      resolve(message.result);
    }
    return;
  }

  // Server-initiated notification (no id) — log and discard
  if (message.method) {
    logDebug(`Server notification: ${message.method}`);
  }
}
