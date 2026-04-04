// Generated from ../../../../scripts/ops/lib/rag/vector-store.mjs:129

import { randomUUID } from "node:crypto";
import { rename, unlink, writeFile } from "node:fs/promises";
import { logDebug } from "./logger.mjs";

export async function atomicWriteJSON(targetPath, data) {
  const tmpPath = `${targetPath}.${randomUUID()}.tmp`;
  try {
    const json = JSON.stringify(data);
    await writeFile(tmpPath, json, "utf-8");
    await rename(tmpPath, targetPath);
    logDebug(`Wrote ${targetPath} (${(json.length / 1024).toFixed(1)} KB)`);
  } catch (err) {
    try {
      await unlink(tmpPath);
    } catch {
      // ignore tmp cleanup failure
    }
    throw err;
  }
}
