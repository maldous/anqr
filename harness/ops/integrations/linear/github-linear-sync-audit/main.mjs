import { auditSync } from "./audit-sync.mjs";
import { logError, logDebug } from "./logger.mjs";

export async function main() {
  const closeOrphans = process.argv.includes("--close-orphans");

  try {
    await auditSync(closeOrphans);
    process.exit(0);
  } catch (error) {
    logError(`[github-linear-sync-audit] Error: ${error.message}`);
    if (error.stack) {
      logDebug(error.stack);
    }
    process.exit(1);
  }
}
