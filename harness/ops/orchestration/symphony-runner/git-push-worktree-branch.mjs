import { execFileSync } from "node:child_process";

import { ROOT } from "./root.mjs";
import { currentBranchNameForRunner } from "./current-branch-name-for-runner.mjs";
import { getRepoHeadSha } from "./get-repo-head-sha.mjs";
import { logInfo, logWarn, logError } from "./logger.mjs";

export async function gitPushWorktreeBranch() {
  const branch = currentBranchNameForRunner();
  if (!/^symphony\/wt\d+$/.test(branch)) {
    logError(`[runner] Refusing to push unexpected branch: ${branch}`);
    return {
      ok: false,
      branch,
      head: getRepoHeadSha("HEAD"),
      error: `unexpected branch: ${branch}`,
    };
  }
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      execFileSync("git", ["push", "-u", "origin", `HEAD:${branch}`], {
        cwd: ROOT,
        stdio: "pipe",
        timeout: 30_000,
        env: { ...process.env, ANQR_AUTOMATION_PUSH: "1" },
      });
      if (attempt > 1) {
        logInfo(`[runner] Git push to ${branch} succeeded on attempt ${attempt}/3`);
      }
      return { ok: true, branch, head: getRepoHeadSha("HEAD") };
    } catch (err) {
      const pushStderr = err.stderr?.toString().trim() || "";
      const pushStdout = err.stdout?.toString().trim() || "";
      const pushExitCode = err.status ?? err.code ?? "unknown";
      if (attempt < 3) {
        logWarn(
          `[runner] Push to ${branch} failed (attempt ${attempt}/3): ${err.message}\n` +
          `  exitCode=${pushExitCode}\n` +
          `  stderr=${pushStderr || "(empty)"}\n` +
          `  stdout=${pushStdout || "(empty)"}`,
        );
        await new Promise((r) => setTimeout(r, attempt * 1000));
      } else {
        logError(
          `[runner] Git push to ${branch} failed after 3 attempts: ${err.message}\n` +
          `  exitCode=${pushExitCode}\n` +
          `  stderr=${pushStderr || "(empty)"}\n` +
          `  stdout=${pushStdout || "(empty)"}`,
        );
        return { ok: false, branch, head: getRepoHeadSha("HEAD"), error: err.message, stderr: pushStderr, stdout: pushStdout };
      }
    }
  }
  return { ok: false, branch, head: getRepoHeadSha("HEAD"), error: "exhausted retries" };
}
