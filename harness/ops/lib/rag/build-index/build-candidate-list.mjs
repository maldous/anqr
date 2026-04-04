import { resolve } from "node:path";
import { stat } from "node:fs/promises";

import { MAX_FILE_BYTES } from "./max-file-bytes.mjs";
import { PROJECT_ROOT } from "./project-root.mjs";
import { VERBOSE } from "./verbose.mjs";
import { classifyFile } from "./classify-file.mjs";
import { discoverTrackedFiles } from "./discover-tracked-files.mjs";
import { getPriority } from "./get-priority.mjs";
import { logWarn } from "./logger.mjs";

export async function buildCandidateList() {
  const trackedFiles = discoverTrackedFiles();
  const trackedSet = new Set(trackedFiles);
  const included = [];
  const statsByReason = new Map();
  let missingCount = 0;

  for (const relPath of trackedFiles) {
    const decision = classifyFile(relPath, trackedSet);
    if (!decision.include) {
      statsByReason.set(decision.reason, (statsByReason.get(decision.reason) || 0) + 1);
      if (VERBOSE && decision.reason !== "unsupported_extension") {
        logWarn(`Skipping ${relPath} (${decision.reason})`);
      }
      continue;
    }

    const absPath = resolve(PROJECT_ROOT, relPath);
    let size;
    try {
      size = (await stat(absPath)).size;
    } catch (err) {
      if (err?.code !== "ENOENT") {
        logWarn(`Failed to stat ${relPath}: ${err?.message || err}`);
      }
      missingCount += 1;
      continue;
    }

    if (size > MAX_FILE_BYTES) {
      statsByReason.set("oversized", (statsByReason.get("oversized") || 0) + 1);
      if (VERBOSE) {
        logWarn(`Skipping ${relPath} (${size} bytes > ${MAX_FILE_BYTES})`);
      }
      continue;
    }

    included.push({ relPath, absPath, size, priority: getPriority(relPath) });
  }

  included.sort((a, b) => a.priority - b.priority || a.relPath.localeCompare(b.relPath));
  return { trackedFiles, included, statsByReason, missingCount };
}
