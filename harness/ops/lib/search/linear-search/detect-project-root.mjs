// Generated from ../../../../scripts/ops/lib/search/linear-search.mjs:17

import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

export function detectProjectRoot() {
  try {
    return execFileSync("git", ["rev-parse", "--show-toplevel"], {
      cwd: process.cwd(),
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return resolve(process.cwd());
  }
}
