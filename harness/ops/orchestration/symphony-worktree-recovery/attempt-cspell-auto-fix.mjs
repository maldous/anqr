// Generated from ../../../scripts/ops/orchestration/symphony-worktree-recovery.mjs:464

import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { readFileSync, writeFileSync } from "node:fs";

import { MAIN_REPO_ROOT } from "./main-repo-root.mjs";
import { parseCspellUnknownWords } from "./parse-cspell-unknown-words.mjs";
import { propagateBaselineFixToCleanWorktrees } from "./propagate-baseline-fix-to-clean-worktrees.mjs";
import { logInfo, logWarn, logError } from "./logger.mjs";

export async function attemptCspellAutoFix(detail) {
  const unknownWords = parseCspellUnknownWords(detail);
  if (unknownWords.length === 0) {
    logWarn("[recovery] cspell failing but could not parse unknown words from output");
    return false;
  }

  const MAX_AUTO_WORDS = 20;
  if (unknownWords.length > MAX_AUTO_WORDS) {
    logWarn(
      `[recovery] Too many unknown cspell words (${unknownWords.length}) — needs manual review`,
    );
    return false;
  }

  // SAFETY: refuse to commit if main repo has uncommitted changes
  try {
    const status = execFileSync("git", ["status", "--porcelain"], {
      cwd: MAIN_REPO_ROOT,
      encoding: "utf-8",
      timeout: 10_000,
    }).trim();
    if (status.length > 0) {
      logWarn(
        "[recovery] Main repo has uncommitted changes — skipping cspell auto-fix to avoid losing work",
      );
      return false;
    }
  } catch (err) {
    logWarn(`[recovery] Could not check main repo git status: ${err.message}`);
    return false;
  }

  // Read current dictionary (.cspell.json is a symlink to cspell.json — only modify the real file)
  const cspellPath = resolve(MAIN_REPO_ROOT, "cspell.json");
  let cspellConfig;
  try {
    cspellConfig = JSON.parse(readFileSync(cspellPath, "utf-8"));
  } catch (err) {
    logWarn(`[recovery] Could not read cspell.json: ${err.message}`);
    return false;
  }

  // Deduplicate against existing words
  const existingWords = new Set(cspellConfig.words.map((w) => w.toLowerCase()));
  const newWords = unknownWords.filter((w) => !existingWords.has(w));
  if (newWords.length === 0) {
    logWarn(
      "[recovery] All unknown words already in dictionary — cspell failure needs manual investigation",
    );
    return false;
  }

  // Append new words (preserves existing order)
  cspellConfig.words.push(...newWords);
  const content = JSON.stringify(cspellConfig, null, 2) + "\n";

  try {
    writeFileSync(cspellPath, content);
  } catch (err) {
    logError(`[recovery] Failed to write cspell config: ${err.message}`);
    return false;
  }

  // Commit and push
  try {
    // .cspell.json is a symlink to cspell.json — only need to add the real file
    execFileSync("git", ["add", "cspell.json"], {
      cwd: MAIN_REPO_ROOT,
      timeout: 10_000,
      stdio: "pipe",
    });
    const subject =
      newWords.length <= 5
        ? `fix: auto-add cspell words: ${newWords.join(", ")}`
        : `fix: auto-add ${newWords.length} cspell words`;
    execFileSync("git", ["commit", "-m", subject], {
      cwd: MAIN_REPO_ROOT,
      timeout: 10_000,
      stdio: "pipe",
      env: { ...process.env, ANQR_AUTOMATION_COMMIT: "1" },
    });
    execFileSync("git", ["push", "origin", "main"], {
      cwd: MAIN_REPO_ROOT,
      timeout: 30_000,
      stdio: "pipe",
      env: { ...process.env, ANQR_AUTOMATION_PUSH: "1" },
    });
    logInfo(
      `[recovery] ✅ Auto-fixed cspell: added ${newWords.length} word(s): ${newWords.join(", ")}`,
    );
  } catch (err) {
    logError(`[recovery] Failed to commit/push cspell fix: ${err.message}`);
    // Revert local changes so main repo stays clean
    try {
      execFileSync("git", ["checkout", "--", "cspell.json"], {
        cwd: MAIN_REPO_ROOT,
        timeout: 10_000,
        stdio: "pipe",
      });
    } catch {
      /* best-effort revert */
    }
    return false;
  }

  // Propagate fix to clean worktrees
  await propagateBaselineFixToCleanWorktrees();
  return true;
}
