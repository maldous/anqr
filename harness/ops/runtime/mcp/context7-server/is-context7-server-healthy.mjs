import { refreshToolRegistry } from "./refresh-tool-registry.mjs";
import { serverProcess } from "./server-process.mjs";
import { serverReady } from "./server-ready.mjs";
import { toolRegistry } from "./tool-registry.mjs";
import { logWarn } from "./logger.mjs";

export async function isContext7ServerHealthy() {
  if (!serverProcess || serverProcess.killed || !serverReady) {
    return false;
  }

  if (toolRegistry?.resolveTool?.name && toolRegistry?.docsTool?.name) {
    return true;
  }

  try {
    const registry = await refreshToolRegistry({ timeoutMs: 2000 });
    return Boolean(registry?.resolveTool?.name && registry?.docsTool?.name);
  } catch (err) {
    logWarn(`Health check registry refresh failed: ${err.message}`);
    return true;
  }
}
