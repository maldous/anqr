// Generated from ../../../../scripts/ops/lib/rag/build-index.mjs:199

import { execFileSync } from "node:child_process";

import { PROJECT_ROOT } from "./project-root.mjs";
import { normalizePath } from "./normalize-path.mjs";

export function discoverTrackedFiles() {
  const raw = execFileSync("git", ["ls-files", "-z"], {
    cwd: PROJECT_ROOT,
    encoding: "utf-8",
    maxBuffer: 20 * 1024 * 1024,
  });

  return raw
    .split("\0")
    .map((value) => value.trim())
    .filter(Boolean)
    .map(normalizePath);
}
