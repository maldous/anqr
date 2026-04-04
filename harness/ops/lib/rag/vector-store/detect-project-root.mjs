// Generated from ../../../../scripts/ops/lib/rag/vector-store.mjs:28

import { resolve } from "node:path";
import { execFileSync } from "node:child_process";

export function detectProjectRoot() {
  if (process.env.RAG_PROJECT_ROOT) {
    return resolve(process.env.RAG_PROJECT_ROOT);
  }

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
