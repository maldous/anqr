// Generated from ../scripts/contracts-check.mjs:27

import { readFile } from "node:fs/promises";

export async function fileExists(targetPath) {
  try {
    await readFile(targetPath, "utf8");
    return true;
  } catch {
    return false;
  }
}
