import { resolve, join } from "node:path";
import { existsSync, statSync, readdirSync } from "node:fs";

import { DOCS_FRESHNESS_DAYS } from "./docs-freshness-days.mjs";
import { ROOT } from "./root.mjs";

export function checkDocsFreshness() {
  const docsDir = resolve(ROOT, "docs");
  if (!existsSync(docsDir)) {
    return { pass: false, detail: "docs/ directory missing" };
  }

  const staleFiles = [];
  const cutoff = Date.now() - DOCS_FRESHNESS_DAYS * 24 * 60 * 60 * 1000;

  function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name.endsWith(".md")) {
        const mtime = statSync(full).mtimeMs;
        if (mtime < cutoff) {
          const rel = full.slice(ROOT.length + 1);
          const daysAgo = Math.floor((Date.now() - mtime) / (24 * 60 * 60 * 1000));
          staleFiles.push(`${rel} (${daysAgo}d)`);
        }
      }
    }
  }

  walk(docsDir);

  if (staleFiles.length === 0) {
    return { pass: true, detail: `All docs modified within ${DOCS_FRESHNESS_DAYS} days` };
  }

  const shown = staleFiles.slice(0, 5);
  const suffix = staleFiles.length > 5 ? ` ... and ${staleFiles.length - 5} more` : "";
  return {
    pass: false,
    detail: `${staleFiles.length} stale docs (>${DOCS_FRESHNESS_DAYS}d): ${shown.join(", ")}${suffix}`,
  };
}
