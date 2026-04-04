// Generated from ../scripts/contracts-check.mjs:18

import { readdir } from "node:fs/promises";

export async function pathExists(targetPath) {
  try {
    await readdir(targetPath);
    return true;
  } catch {
    return false;
  }
}
