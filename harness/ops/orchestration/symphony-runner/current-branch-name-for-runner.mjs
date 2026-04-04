import { execFileSync } from "node:child_process";

import { ROOT } from "./root.mjs";

export function currentBranchNameForRunner() {
  return execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
    cwd: ROOT,
    encoding: "utf-8",
  }).trim();
}
