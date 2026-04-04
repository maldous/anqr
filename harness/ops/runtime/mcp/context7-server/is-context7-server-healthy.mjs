import { sendRequest } from "./send-request.mjs";
import { serverProcess } from "./server-process.mjs";
import { serverReady } from "./server-ready.mjs";
import { logWarn } from "./logger.mjs";

export async function isContext7ServerHealthy() {
  if (!serverProcess || serverProcess.killed || !serverReady) {
    return false;
  }

  try {
    // Use tools/list as a lightweight health probe — it should always succeed
    await sendRequest("tools/list", {}, 5000);
    return true;
  } catch (err) {
    logWarn(`Health check failed: ${err.message}`);
    return false;
  }
}
