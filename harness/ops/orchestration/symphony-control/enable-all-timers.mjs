import { execFileSync } from "node:child_process";
import { logInfo, logError } from "./logger.mjs";

export function enableAllTimers() {
  logInfo("▶️  Enabling Linear runner timers (wt1-wt4 only)...");
  try {
    // Enable only Linear runners (wt1-wt4).
    // Discord worktrees (wt5-wt8) use executor services, NOT runner timers.
    // See: Clean architecture — wt1-wt4 for Linear, wt5-wt8 for Discord.
    const runners = ["1", "2", "3", "4"];
    for (const id of runners) {
      execFileSync("systemctl", ["--user", "enable", `anqr-linear-runner@${id}.timer`], {
        stdio: "pipe",
      });
      execFileSync("systemctl", ["--user", "start", `anqr-linear-runner@${id}.timer`], {
        stdio: "pipe",
      });
    }

    logInfo("✅ Linear runner timers enabled and started (wt1-wt4)");
    logInfo("🚀 Runners will begin picking up tasks on next timer cycle");
    return true;
  } catch (err) {
    logError(`Failed to enable timers: ${err.message}`);
    return false;
  }
}
