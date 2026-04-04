import { readdir, rm } from "node:fs/promises";
import { basename } from "node:path";

import { INDEX_DIR } from "./index-dir.mjs";
import { INDEX_FILE } from "./index-file.mjs";
import { MANIFEST_FILE } from "./manifest-file.mjs";
import { toNameSet } from "./to-name-set.mjs";
import { logDebug, logWarn } from "./logger.mjs";

export async function cleanupStaleIndexFiles(expectedShardFiles = [], options = {}) {
  const keep = toNameSet(expectedShardFiles);
  const keepLegacyIndex = Boolean(options.keepLegacyIndex);
  const keepManifest = Boolean(options.keepManifest);

  let names = [];
  try {
    names = await readdir(INDEX_DIR);
  } catch (err) {
    if (err?.code !== "ENOENT") {
      logWarn(`Failed to list index directory for cleanup: ${err?.message || err}`);
    }
    return;
  }

  const removals = [];
  for (const name of names) {
    if (/^index-\d+\.json$/i.test(name) && !keep.has(name)) {
      removals.push(`${INDEX_DIR}/${name}`);
      continue;
    }
    if (name === basename(INDEX_FILE) && !keepLegacyIndex) {
      removals.push(INDEX_FILE);
      continue;
    }
    if (name === basename(MANIFEST_FILE) && !keepManifest) {
      removals.push(MANIFEST_FILE);
    }
  }

  for (const target of removals) {
    try {
      await rm(target, { force: true });
      logDebug(`Removed stale index file: ${target}`);
    } catch (err) {
      logWarn(`Failed to remove stale index file ${target}: ${err?.message || err}`);
    }
  }
}
