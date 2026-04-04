import { resolve } from "node:path";
import { existsSync, statSync, readFileSync } from "node:fs";

import { ROOT } from "./root.mjs";

export async function checkLinearRagPipeline() {
  const exportFile = resolve(ROOT, "reports/linear-export/issues-latest.json");
  const indexDir = resolve(ROOT, "reports/rag-index-linear");
  const indexFile = resolve(indexDir, "index.json");
  const metaFile = resolve(indexDir, "meta.json");

  const exportExists = existsSync(exportFile);
  const indexExists = existsSync(indexFile);
  const metaExists = existsSync(metaFile);

  if (!exportExists && !indexExists) {
    return { pass: true, detail: "Linear RAG not yet configured — skipped" };
  }

  const issues = [];
  let exportStats = null;
  let indexStats = null;

  // Check export file
  if (exportExists) {
    try {
      const exportData = JSON.parse(readFileSync(exportFile, "utf-8"));
      const exportStat = statSync(exportFile);
      const exportAge = Math.floor((Date.now() - exportStat.mtimeMs) / (60 * 60 * 1000));
      exportStats = {
        count: Array.isArray(exportData) ? exportData.length : 0,
        ageHours: exportAge,
      };

      if (exportAge > 48) {
        issues.push(`export stale (${exportAge}h old)`);
      }
    } catch (err) {
      issues.push(`export invalid: ${err.message}`);
    }
  } else {
    issues.push("export missing");
  }

  // Check index
  if (indexExists && metaExists) {
    try {
      const meta = JSON.parse(readFileSync(metaFile, "utf-8"));
      const indexStat = statSync(indexFile);
      const indexAge = Math.floor((Date.now() - indexStat.mtimeMs) / (60 * 60 * 1000));
      indexStats = {
        chunks: meta.chunkCount || 0,
        ageHours: indexAge,
        sizeKB: Math.floor((meta.indexSizeBytes || 0) / 1024),
      };

      if (indexAge > 48) {
        issues.push(`index stale (${indexAge}h old)`);
      }

      if (exportStats && indexStats.chunks < exportStats.count * 0.9) {
        issues.push(
          `chunk count mismatch (${indexStats.chunks} chunks vs ${exportStats.count} issues)`,
        );
      }
    } catch (err) {
      issues.push(`index invalid: ${err.message}`);
    }
  } else if (exportExists) {
    issues.push("index missing");
  }

  if (issues.length > 0) {
    return { pass: false, detail: issues.join("; ") };
  }

  const exportDetail = exportStats
    ? `${exportStats.count} issues (${exportStats.ageHours}h)`
    : "N/A";
  const indexDetail = indexStats
    ? `${indexStats.chunks} chunks, ${indexStats.sizeKB}KB (${indexStats.ageHours}h)`
    : "N/A";

  return {
    pass: true,
    detail: `Export: ${exportDetail} | Index: ${indexDetail}`,
  };
}
