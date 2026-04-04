import { execFileSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";

import { ROOT } from "./root.mjs";
import { getRepoHeadSha } from "./get-repo-head-sha.mjs";
import { removeTempFile } from "./remove-temp-file.mjs";
import { writePreValidationPatch } from "./write-pre-validation-patch.mjs";
import { logError } from "./logger.mjs";

export function syncWorktreeBeforeValidation(changedFiles) {
  const previousHead = getRepoHeadSha("HEAD");
  let patchFile = null;

  try {
    patchFile = writePreValidationPatch(changedFiles);
    execFileSync("git", ["reset", "--hard", "HEAD"], { cwd: ROOT, stdio: "pipe" });
    execFileSync("git", ["clean", "-fd"], { cwd: ROOT, stdio: "pipe" });
    execFileSync("git", ["fetch", "origin", "main"], { cwd: ROOT, stdio: "pipe" });
    execFileSync("git", ["merge", "origin/main", "--ff-only"], { cwd: ROOT, stdio: "pipe" });

    const patchSize = statSync(patchFile).size;
    if (patchSize > 0) {
      execFileSync("git", ["apply", "--index", "--3way", patchFile], {
        cwd: ROOT,
        stdio: "pipe",
      });
    }

    removeTempFile(patchFile);
    return { ok: true };
  } catch (err) {
    const stderr = err.stderr?.toString?.() || "";
    const stdout = err.stdout?.toString?.() || "";
    const conflictDetected =
      stderr.includes("CONFLICT") ||
      stdout.includes("CONFLICT") ||
      stderr.includes("patch does not apply") ||
      stdout.includes("patch does not apply") ||
      stderr.includes("could not build fake ancestor") ||
      stdout.includes("could not build fake ancestor");

    try {
      execFileSync("git", ["merge", "--abort"], { cwd: ROOT, stdio: "pipe" });
    } catch {}
    try {
      execFileSync("git", ["rebase", "--abort"], { cwd: ROOT, stdio: "pipe" });
    } catch {}
    try {
      execFileSync("git", ["reset", "--hard", previousHead], { cwd: ROOT, stdio: "pipe" });
      execFileSync("git", ["clean", "-fd"], { cwd: ROOT, stdio: "pipe" });
      if (patchFile && existsSync(patchFile) && statSync(patchFile).size > 0) {
        execFileSync("git", ["apply", patchFile], { cwd: ROOT, stdio: "pipe" });
      }
    } catch (error_) {
      logError(`[runner] Failed to restore pre-validation state: ${error_.message}`);
    } finally {
      removeTempFile(patchFile);
    }

    return { ok: false, conflictDetected, error: err };
  }
}
