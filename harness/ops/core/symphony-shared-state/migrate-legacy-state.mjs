import fs from "node:fs";
import path from "node:path";
import { ensureBridgeStateDir } from "./get-bridge-state-dir.mjs";

/**
 * One-time migration of bridge state files from the legacy worktree-local
 * directory (`<PROJECT_ROOT>/reports/symphony/`) to the shared bridge state
 * directory.
 *
 * This runs at bridge startup. If the shared dir is empty and the legacy dir
 * has files, they are copied (not moved) to preserve the originals as backup.
 * A marker file (`migrated-from-legacy`) is written to prevent re-migration.
 *
 * This is safe to call on every startup — it's idempotent.
 */
export function migrateLegacyState() {
  const bridgeDir = ensureBridgeStateDir();
  const markerPath = path.join(bridgeDir, "migrated-from-legacy");

  // Already migrated — skip
  if (fs.existsSync(markerPath)) return;

  // Resolve the legacy directory from the repo root.
  // This file is at: harness/ops/core/symphony-shared-state/migrate-legacy-state.mjs
  // Repo root is 4 levels up: harness/ops/core/symphony-shared-state/ -> harness/ops/core/ -> harness/ops/ -> harness/ -> repo-root/
  const legacyDir = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    "..",
    "..",
    "..",
    "..",
    "reports",
    "symphony",
  );

  if (!fs.existsSync(legacyDir)) {
    // No legacy state to migrate — write marker and return
    fs.writeFileSync(markerPath, `migrated: none found at ${legacyDir}\n`);
    return;
  }

  const filesToMigrate = [
    "session-state.json",
    "provider-health.json",
    "provider-failures.json",
    "provider-stats.json",
    "provider-leases.json",
    "provider-probe-cache.json",
    "provider-probe-results.json",
  ];

  let migrated = 0;
  for (const fileName of filesToMigrate) {
    const src = path.join(legacyDir, fileName);
    const dst = path.join(bridgeDir, fileName);
    if (fs.existsSync(src) && !fs.existsSync(dst)) {
      try {
        fs.copyFileSync(src, dst);
        migrated++;
      } catch {
        /* best-effort — don't block startup */
      }
    }
  }

  fs.writeFileSync(
    markerPath,
    `migrated: ${migrated} files from ${legacyDir} at ${new Date().toISOString()}\n`,
  );
}
