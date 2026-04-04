import { rejectAllPending } from "./reject-all-pending.mjs";
import { serverProcess, setServerProcess } from "./server-process.mjs";
import { setServerReady } from "./server-ready.mjs";
import { setStdoutBuffer } from "./stdout-buffer.mjs";
import { logDebug, logInfo, logWarn } from "./logger.mjs";

export async function stopContext7Server() {
  if (!serverProcess) {
    logDebug("Context7 MCP server is not running — nothing to stop");
    return;
  }

  logInfo("Stopping Context7 MCP server...");

  rejectAllPending("Server is shutting down");

  return new Promise((resolve) => {
    const forceKillTimer = setTimeout(() => {
      if (serverProcess && !serverProcess.killed) {
        logWarn("Force-killing Context7 MCP server (SIGKILL)");
        serverProcess.kill("SIGKILL");
      }
      cleanup();
      resolve();
    }, 5000);

    function cleanup() {
      clearTimeout(forceKillTimer);
      setServerProcess(null);
      setServerReady(false);
      setStdoutBuffer("");
    }

    if (serverProcess.killed) {
      cleanup();
      resolve();
      return;
    }

    serverProcess.once("exit", () => {
      logInfo("Context7 MCP server stopped");
      cleanup();
      resolve();
    });

    serverProcess.kill("SIGTERM");
  });
}
