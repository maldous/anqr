import { execSync } from "node:child_process";
import { updateMemory } from "../../../lib/update-memory.mjs";
import { logProviderStats } from "../symphony-credit-gate.mjs";

import { providerStatusCache } from "./provider-status-cache.mjs";
import { server } from "./server.mjs";
import { logInfo, logError } from "./logger.mjs";

export async function shutdown(signal) {
  logInfo(`\nReceived ${signal}, shutting down...`);

  // Don't send shutdown notification - will send combined restart message on startup

  // Update MEMORY.md BEFORE shutdown
  try {
    const commitHash = execSync("git rev-parse --short HEAD", {
      encoding: "utf-8",
      cwd: process.cwd(),
    }).trim();
    const available = providerStatusCache.probeResults.filter((r) => r.available).length;
    const total = providerStatusCache.configured.length;
    await updateMemory(
      `Symphony Bridge stopped (PID ${process.pid}, commit ${commitHash}, ${available}/${total} providers, signal: ${signal})`,
    );
    logInfo(`📝 Updated MEMORY.md before shutdown`);
  } catch (err) {
    logError(`⚠️ Failed to update MEMORY.md on shutdown: ${err.message}`);
  }

  // No cleanup needed - setTimeout will be cleared on process exit
  // Discord monitoring was removed - OpenClaw handles Discord interaction directly
  // stopDiscordMonitoring(); // REMOVED - function no longer exists
  // stopProcessingStatusUpdates(); // REMOVED - function no longer exists
  logProviderStats();
  server.close(() => {
    logInfo("Server closed");
  });
  // Exit immediately without waiting for active connections
  process.exit(0);
}
