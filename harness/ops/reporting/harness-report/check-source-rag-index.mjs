import { resolve } from "node:path";
import { existsSync, statSync, readFileSync } from "node:fs";

import { ROOT } from "./root.mjs";

export async function checkSourceRagIndex() {
  const indexDir = resolve(ROOT, "reports/rag-index");
  const manifestFile = resolve(indexDir, "manifest.json");
  const metaFile = resolve(indexDir, "meta.json");

  const manifestExists = existsSync(manifestFile);
  const metaExists = existsSync(metaFile);

  if (!manifestExists && !metaExists) {
    return { pass: false, detail: "index missing" };
  }

  const issues = [];
  let manifestData = null;

  if (manifestExists) {
    try {
      manifestData = JSON.parse(readFileSync(manifestFile, "utf-8"));
      const manifestStat = statSync(manifestFile);
      const ageHours = Math.floor((Date.now() - manifestStat.mtimeMs) / (60 * 60 * 1000));

      if (ageHours > 48) {
        issues.push(`index stale (${ageHours}h old)`);
      }

      const shardCount = manifestData.shardCount || 0;
      if (shardCount === 0) {
        issues.push("no shards in manifest");
      } else {
        const missingShards = (manifestData.shards || []).filter(
          (s) => !existsSync(resolve(indexDir, s.filename)),
        );
        if (missingShards.length > 0) {
          issues.push(`${missingShards.length}/${shardCount} shard files missing`);
        }
      }
    } catch (err) {
      issues.push(`manifest invalid: ${err.message}`);
    }
  } else {
    issues.push("manifest missing");
  }

  if (!metaExists) {
    issues.push("meta missing");
  }

  if (issues.length > 0) {
    return { pass: false, detail: issues.join("; ") };
  }

  const entries = manifestData.totalEntries || 0;
  const shards = manifestData.shardCount || 0;
  const manifestStat = statSync(manifestFile);
  const ageHours = Math.floor((Date.now() - manifestStat.mtimeMs) / (60 * 60 * 1000));

  return {
    pass: true,
    detail: `${entries} entries across ${shards} shards (${ageHours}h old)`,
  };
}
