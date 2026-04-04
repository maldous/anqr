import { execFileSync } from "node:child_process";

import { ROOT } from "./root.mjs";
import { logError } from "./logger.mjs";

export function gitRevert() {
  try {
    execFileSync("git", ["reset", "--hard", "HEAD"], { cwd: ROOT, stdio: "pipe" });
    execFileSync("git", ["clean", "-fd"], { cwd: ROOT, stdio: "pipe" });
    return true;
  } catch (err) {
    logError(`[runner] Git revert failed: ${err.message}`);
    return false;
  }
}
