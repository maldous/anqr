import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { writeFileSync, unlinkSync } from "node:fs";

import { HEADER_MAX_LENGTH } from "./header-max-length.mjs";
import { ROOT } from "./root.mjs";
import { inferCommitScope } from "./infer-commit-scope.mjs";
import { normalizeRepoPath } from "./normalize-repo-path.mjs";
import { sanitizeCommitSubject } from "./sanitize-commit-subject.mjs";
import { logError } from "./logger.mjs";

export function gitCommit(issueIdentifier, issueTitle, summary, changedFiles) {
  try {
    const filesToStage = [
      ...new Set((changedFiles || []).map((file) => normalizeRepoPath(file)).filter(Boolean)),
    ];
    if (filesToStage.length === 0) {
      throw new Error("No changed source files available to stage");
    }

    execFileSync("git", ["add", "--", ...filesToStage], { cwd: ROOT, stdio: "pipe" });
    const scope = inferCommitScope(changedFiles);
    const subject = sanitizeCommitSubject(issueTitle);
    const prefix = `fix(${scope}): `;
    const maxSubjectLen = HEADER_MAX_LENGTH - prefix.length;
    const truncatedSubject =
      subject.length > maxSubjectLen ? `${subject.slice(0, maxSubjectLen - 1)}…` : subject;
    const header = `${prefix}${truncatedSubject}`;
    const body = `${issueIdentifier}\n\n${summary}`;
    const msg = `${header}\n\n${body}`;
    const tmpFile = resolve(ROOT, ".git", "SYMPHONY_COMMIT_MSG");
    writeFileSync(tmpFile, msg, "utf-8");
    try {
      execFileSync("git", ["commit", "--no-verify", "-F", tmpFile], {
        cwd: ROOT,
        stdio: "pipe",
        env: { ...process.env, ANQR_AUTOMATION_COMMIT: "1" },
      });
    } finally {
      try {
        unlinkSync(tmpFile);
      } catch {}
    }
    return true;
  } catch (err) {
    // Capture rich diagnostics for commit failure observability
    const stderr = err.stderr?.toString().trim() || "";
    const stdout = err.stdout?.toString().trim() || "";
    const exitCode = err.status ?? err.code ?? "unknown";
    let branch = "unknown";
    let headSha = "unknown";
    let porcelain = "";
    try {
      branch = execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
        cwd: ROOT, encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"],
      }).trim();
    } catch {}
    try {
      headSha = execFileSync("git", ["rev-parse", "--short", "HEAD"], {
        cwd: ROOT, encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"],
      }).trim();
    } catch {}
    try {
      porcelain = execFileSync("git", ["status", "--porcelain"], {
        cwd: ROOT, encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"],
      }).trim().slice(0, 500);
    } catch {}
    logError(
      `[runner] Git commit failed: ${err.message}\n` +
      `  exitCode=${exitCode} branch=${branch} HEAD=${headSha}\n` +
      `  porcelain=${porcelain || "(empty)"}\n` +
      `  stderr=${stderr || "(empty)"}\n` +
      `  stdout=${stdout || "(empty)"}`,
    );
    return false;
  }
}
