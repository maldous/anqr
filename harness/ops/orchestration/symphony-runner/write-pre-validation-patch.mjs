import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

import { ROOT } from "./root.mjs";
import { normalizeRepoPath } from "./normalize-repo-path.mjs";

export function writePreValidationPatch(changedFiles) {
  const patchFile = resolve(ROOT, ".git", `SYMPHONY_PREVALIDATION_${Date.now()}.patch`);
  const filesToCapture = [
    ...new Set((changedFiles || []).map((file) => normalizeRepoPath(file)).filter(Boolean)),
  ];
  const args = ["diff", "--binary", "--full-index", "HEAD"];
  if (filesToCapture.length > 0) args.push("--", ...filesToCapture);
  const patch = execFileSync("git", args, {
    cwd: ROOT,
    encoding: "utf-8",
    stdio: "pipe",
  });
  writeFileSync(patchFile, patch, "utf-8");
  return patchFile;
}
