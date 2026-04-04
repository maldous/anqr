import fs from "node:fs";

import { getLockFile } from "./get-lock-file.mjs";

export function releaseStateLock() {
  try {
    const lockFile = getLockFile();
    const lockPid = Number(fs.readFileSync(lockFile, "utf-8").trim());
    if (lockPid === process.pid) fs.unlinkSync(lockFile);
  } catch {
    /* best effort */
  }
}
