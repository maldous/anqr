import { execFileSync } from "node:child_process";

export function checkSystemdTimer(timerName) {
  try {
    const output = execFileSync("systemctl", ["--user", "is-active", timerName], {
      encoding: "utf-8",
    });
    return output.trim() === "active";
  } catch {
    return false;
  }
}
