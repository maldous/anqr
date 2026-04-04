import { execFileSync } from "node:child_process";
import { logError } from "./logger.mjs";

export function getTimerStatus() {
  try {
    const output = execFileSync(
      "systemctl",
      ["--user", "list-timers", "anqr-linear-runner@*.timer", "--all"],
      {
        encoding: "utf-8",
      },
    );
    return output;
  } catch (err) {
    logError(`Failed to get timer status: ${err.message}`);
    return null;
  }
}
