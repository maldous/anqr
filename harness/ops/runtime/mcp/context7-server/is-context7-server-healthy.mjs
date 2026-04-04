import { refreshToolRegistry } from "./refresh-tool-registry.mjs";
import { serverProcess } from "./server-process.mjs";
import { serverReady } from "./server-ready.mjs";
import { logWarn } from "./logger.mjs";

export async function isContext7ServerHealthy() {
  if (!serverProcess || serverProcess.killed || !serverReady) {
    return false;
  }

  try {
    const registry = await refreshToolRegistry({ force: true, timeoutMs: 5000 });
    return Boolean(registry?.resolveTool?.name && registry?.docsTool?.name);
  } catch (err) {
    logWarn(`Health check failed: ${err.message}`);
    return false;
  }
}
