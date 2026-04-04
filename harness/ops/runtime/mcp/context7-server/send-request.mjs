import { REQUEST_TIMEOUT_MS } from "./request-timeout-ms.mjs";
import { nextRequestId, setNextRequestId } from "./next-request-id.mjs";
import { pendingRequests } from "./pending-requests.mjs";
import { serverProcess } from "./server-process.mjs";
import { logDebug } from "./logger.mjs";

export function sendRequest(method, params = {}, timeoutMs = REQUEST_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    if (!serverProcess || !serverProcess.stdin || serverProcess.killed) {
      reject(new Error("Context7 MCP server is not running"));
      return;
    }

    const id = nextRequestId;
    setNextRequestId(nextRequestId + 1);
    const request = { jsonrpc: "2.0", id, method, params };

    const timer = setTimeout(() => {
      pendingRequests.delete(id);
      reject(new Error(`JSON-RPC request ${method} (id=${id}) timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    pendingRequests.set(id, { resolve, reject, timer });

    const payload = JSON.stringify(request) + "\n";
    logDebug(`Sending JSON-RPC request: ${method}`, { id });

    try {
      serverProcess.stdin.write(payload, "utf-8", (err) => {
        if (err) {
          pendingRequests.delete(id);
          clearTimeout(timer);
          reject(new Error(`Failed to write to server stdin: ${err.message}`));
        }
      });
    } catch (err) {
      pendingRequests.delete(id);
      clearTimeout(timer);
      reject(new Error(`Failed to send request: ${err.message}`));
    }
  });
}
