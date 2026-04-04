import { existsSync, readFileSync, unlinkSync } from "node:fs";

import { LOCK_FILE } from "./lock-file.mjs";

export function releaseLock() {
  try {
    if (!existsSync(LOCK_FILE)) return;
    const pid = Number(readFileSync(LOCK_FILE, "utf-8").trim());
    if (pid === process.pid) unlinkSync(LOCK_FILE);
  } catch {
    // best effort
  }
}
